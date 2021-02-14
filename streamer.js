/**
 * Web Streamer 
 * https://github.com/julienetie/web-streamer
 * (c) Julien Etienne 2021
 */

// Function type-checker
const isFunction = value => typeof value === 'function';
/**
 * Streams data from a pending fetch Promise.
 * Options:
 *  flow          - A callback invoked per reading of a chunk  
 *  paused        - A callback that triggers when the reader is paused
 *  stopped       - A callback that triggers when the reader is stopped
 *  complete      - A callback that triggers when the download has fully completed
 * @param {Object} fetch          - Promise returned from a fetch call 
 * @param {Object} options        - Lifecycle callbacks  
 * @returns {Object}              - A promise with controll parameters
 */
const streamer = (fetch, {flow, paused, stopped, complete}) => {
    let contentLength;
    let reader;
    let amount = 0;
    let response;
    let acc = new Uint8Array(0);
    let canRead = true;

    // Ensure fetch is a promise
    if(!fetch instanceof Promise){
        console.warn(`${fetch} should be a promise`);
    }
    // The flow callback is required
    if(!isFunction(flow)){
        console.warn(`${flow} should be a function`);
    }

    /* 
        Process the active stream by invoking flow
        for each read of a chunk.
    */
   let progress;
    const processStream = ({value, done}) => {
        // Accumilate chunks
        acc = value && new Uint8Array([...acc, ...value]);

        if(value){
        amount += value.byteLength;
        progress = amount / contentLength * 100;
        }
        if(progress === 100){
            isFunction(complete) && complete();
        }

        flow(response, progress, acc);
        if(acc && (acc.byteLength === contentLength)){
            reader.read().then(processStream);
            return;
        }

        if(!done && canRead){
            reader.read().then(processStream);
        }

        if(!canRead){
            isFunction(paused) && paused();
        }
        if(done){
            isFunction(stopped) && stopped();       
        }
    }

    /* 
        Pauses the reading of the stream.
        This does not stop the stream, just the 
        flow callback.
    */
    const pauseReading = () => {
        canRead = false;
    }
    /*
        Stops the reading and closes the stream.
    */
    const stopReading = () => {
        canRead = false;
        reader.cancel();
    };

    /* 
        Continues reading a stream in progress or a 
        completed stream. Only a paused stream can be
        continued.
    */
    const continueReading = () =>{
        canRead = true;
        reader.read().then(processStream);
    };

    return new Promise((resolve, reject) => {
        fetch
            .then(fetchResponse => {
                reader = fetchResponse.body.getReader();
                contentLength = parseInt(fetchResponse.headers.get('content-length'),10);

                // Process stream
                response = new Response(new ReadableStream({
                    start: ()=> reader.read().then(processStream)
                }));
                /* 
                    Controlls of the reader
                */
                resolve({ response, pauseReading, continueReading, stopReading, fetch });
            });
    });
}
