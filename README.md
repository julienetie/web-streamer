# ¯\(°_o)/¯ Web-Streamer

#### Web-Streamer is a tiny minimalistic streaming library for processing data streams to the browser in real-time.

### Features:
- `fetch`: The Promise return of a fetch request  
- `flow`: A callback to process data whilst being streamed
- `pauseReading`: Pauses the reading of a stream (not the request)
- `continueReading`: continues reading from a paused stream
- `stopReading`: kills the request (unlike pauseReading)
- Exceptions are handeled the usual way
- Streamer returns a promise

### Install 
Using bundling packages

`npm i web-streamer`

As a native ES module 

`wget -c https://raw.githubusercontent.com/julienetie/web-streamer/mainline/streamer.js`

### Usage 
```javascript 
  import streamer from './streamer.js'
  
  const url = 'https://fetch-progress.anthum.com/30kbps/images/sunrise-baseline.jpg';
  
  // The flow callback will be invoked for each chunk recieved
  const flow = () => <do stuff>
  
  // The closed callback is invoked once the reader has been canceled
  const closed = () => <do stuff>
  
  streamer(
    fetch(url),
    flow,
    closed
  )
  .then(({response, pauseReading, continueReading, stopReading}) =>{
    // See Features
  });
```

### Compatibility
Streamer supports all evergreen browsers (not IE11). It does not support node.js or deno.

MIT © Julien Etienne 2021
