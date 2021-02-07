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


const intermittentLoop = delay;


const streamFile = async ({ fetch, flow, closed, incomplete }) => {
    const fetchResponse = await fetch;
    const contentLength = fetchResponse.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;
    const reader = fetchResponse.body.getReader();
    let response;
    let isIncomplete;
    let continueReading;

    const collect = () => {
        response = new Response(new ReadableStream({
            async start(controller) {
                while (true) {
                    const {
                        done,
                        value
                    } = await reader.read();

                    // Reader closed
                    if (done) {
                        console.log({value, done})
                        console.log('loaded < contentLength', isFunction(incomplete))
                        loaded < contentLength && isFunction(incomplete) && incomplete(
                            contentLength,
                            loaded
                        );

                        isFunction(closed) && closed(response);
                        break;

                    }
                    // Add the number of bytes within the chunk
                    loaded += value.byteLength;
                    const completionValue = loaded / total * 100;
                    flow(completionValue);
                    // Adds the value to the stream.
                    controller.enqueue(value);
                }
                // Stream closed
                controller.close();

            },
            pull(controller) {
                // console.log('pull: controller', controller)
            },
            cancel(reason) {
                // console.log('canceled')
            }
        }));
    };
    collect();

    return new Promise((resolve, reject) => {
        resolve({ response, reader, isIncomplete, continueReading });
    });
}