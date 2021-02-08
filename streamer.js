const isFunction = value => typeof value === 'function';

const streamFile = (fetch, flowCallback, closed) => {
    let contentLength;
    let reader;
    let flow;
    let amount = 0;
    let response;
    let acc = new Uint8Array(0);

    const getLength = response => [
        response,
        parseInt(response.headers.get('content-length'),10)
    ];

    const getReader = result => [
        ...result,
        result[0].body.getReader()
    ];


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
        } else{
            console.log('pause-reader')
        }
        if(done){
            flow(response, 100, acc);
            isFunction(closed) && closed();
        }
    }
    let canRead = true;
    let isDone = false;

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
        console.log('continue-reading')
        canRead = true;
        reader.read().then(processStream);
    };

    return new Promise((resolve, reject) => {
        fetch
        .then(getLength)
        .then(getReader)
        .then(([responseObject, contentLengthValue, readerObject])=> {
            reader = readerObject;
            contentLength = contentLengthValue;

            flow = flowCallback;
            // Process stream
            response = new Response(new ReadableStream({
                start(){
                    reader.read().then(processStream);
                }
            }))
            /* 
                Controlls of the reader
             */
            resolve({ response, pauseReading, continueReading, stopReading });
        });
    });
}
