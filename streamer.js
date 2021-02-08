const isFunction = value => typeof value === 'function';
/**
 * Streams data from a pending fetch Promise.
 * @param {Object} fetch         - Promise returned from a fetch call 
 * @param {Function} flow        - A callback invoked per reading of a chunk  
 * @param {Function} closed      - A callback that triggers when the request is closed
 * @returns {Object}             - A promise with controll parameters
 */
const streamer = (fetch, flow, closed) => {
    let contentLength;
    let reader;
    let amount = 0;
    let response;
    let acc = new Uint8Array(0);
    let canRead = true;

    /* 
        Process the active stream by invoking flow
        for each read of a chunk.
    */
    const processStream = ({value, done}) => {
        // Accumilate chunks
        acc = value && new Uint8Array([...acc, ...value]);

        if(acc && (acc.byteLength === contentLength)){
            reader.read().then(processStream);
            return;
        }

        if(!done && canRead){
            amount += value.byteLength;
            const progress = amount / contentLength * 100;
            flow(response, progress, acc);
            reader.read().then(processStream);
        }
        if(done){
            flow(response, 100, acc);
            isFunction(closed) && closed();
        }
    };

    /* 
        Pauses the reading of the stream.
        This does not stop the stream, just the 
        flow callback.
    */
    const pauseReading = () => canRead = false;

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
