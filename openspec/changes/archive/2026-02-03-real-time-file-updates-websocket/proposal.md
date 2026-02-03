## Why

Currently, the user has to manually refresh the browser to see new files or changes made by other processes or users. Implementing WebSockets provides real-time notifications, significantly improving the user experience and making the application feel more modern and responsive.

## What Changes

- **Backend WebSocket Server**: Implement a WebSocket hub in the Go backend to manage client connections and broadcast file system events.
- **Frontend WebSocket Hook**: Create a reusable React hook (`useWebSocket`) to handle connections, reconnection logic, and message handling.
- **Real-time File Updates**: Integrate the WebSocket listener into the `HomePage` (and potentially other components) to trigger file list refreshes automatically when events like `CREATE`, `RENAME`, or `DELETE` are received.
- **FS Watcher Integration**: Connect the Go backend's file system monitoring (if exists or needed) to the WebSocket hub.

## Capabilities

### New Capabilities
- `real-time-events`: Core WebSocket infrastructure for broadcasting system events to connected clients.

### Modified Capabilities
- `files`: Update file management requirements to include real-time synchronization of the file list.

## Impact

- `http/` (backend): New WebSocket handlers.
- `frontend/src/hooks/`: New `useWebSocket` hook.
- `frontend/src/features/files/`: Integration with `HomePage`.
- `main.go`: Initialization of the WebSocket hub.
