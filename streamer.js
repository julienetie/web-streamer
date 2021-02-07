const isFunction = value => typeof value === 'function';

const delay = (callback, duration) => {
    let startTime = 0;
    let terminate = false;

    function loop(timestamp) {
        if (startTime === 0) {
            startTime = timestamp;
        }

        if (timestamp > startTime + duration && !terminate) {
            if (typeof callback === 'function') {
                callback();
            };
            terminate = true;
        } else {
            requestAnimationFrame(loop);
        }
    }
    requestAnimationFrame(loop);
}


const streamFile = ({ fetch, flow: flowCallback, closed, incomplete }) => { 

    const getLength = response => [
        response, 
        parseInt(response.headers.get('content-length'),10)
    ];

    const getReader = result => [
        ...result, 
        result[0].body.getReader()
    ];
    let contentLength; 
    let reader; 
    let flow; 
    let amount = 0;
    let controller;
    let response; 
    let acc = new Uint8Array(0);
    let createFakeChunksOnce = true;
    let fakeChunks; 
    let fakeChunksIndex = 0;
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
        }
    }
    let canRead = true;
    const pauseReader = () =>{
        canRead = false;
    }
    const stopReading = () => {
        canRead = false;
        reader.cancel();
    }
    
    let isDone = false;
    const continueReading = () =>{
        console.log('continue-reading')
        canRead = true;
        reader.read().then(processStream);
    }   

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
                start(controllerObject){
                    controller = controllerObject;
                    reader.read().then(processStream);
                }
            }))
            resolve({ pauseReader, continueReading, response, stopReading });
        });        
    });
}