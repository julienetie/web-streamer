# ¯\(°_o)/¯ Streamer

#### Streamer is a tiny minimalistic streaming library for processing data streams to the browser in real-time.
Features:
- `fetch`: The Promise return of a fetch request  
- `flow`: A callback to process data whilst being streamed
- `pauseReading`: Pauses the reading of a stream (not the request)
- `continueReading`: continues reading from a paused stream
- `stopReading`: kills the request (unlike pauseReading)
- Exceptions are handeled the usual way
- Streamer returns a promise

## Compatibility
Streamer supports all evergreen browsers (not IE11). It does not support node.js or deno.

MIT © Julien Etienne 2021
