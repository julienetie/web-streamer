# Stream

Stream is a [readableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream) wrapper for the browser that allows you to:
- Obtain the progress of the stream
- Perform streaming operations in real-time
- Cancel reading of a stream
- Handel errors
- Process the response

## Compatibility
Stream supports all evergreen browsers (not IE11) it does not support node.js or
deno.

## Future updates
- Chunk size allocation
- Queuing strategy
- Auto-resolve functions (images, text, etc)
- Pause/ continue 
- Backpressure 
