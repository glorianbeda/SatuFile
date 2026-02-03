## Context

The current application lacks real-time updates. If a file is uploaded via another device or renamed by another user, the current view remains stale until a manual refresh. We need a way to push updates to the client.

## Goals / Non-Goals

**Goals:**
- Implement a centralized WebSocket Hub in Go.
- Use `fsnotify` to watch the root data directory for changes.
- Provide a reusable `useWebSocket` hook in React.
- Automatically refresh the file list in `HomePage` upon receiving file system events.

**Non-Goals:**
- Implementing fine-grained permissions per WebSocket event (broadcast to all for now, assuming single-user/trusted environment as per current state).
- Real-time collaborative editing.

## Decisions

- **Library Choice**: Use `github.com/gorilla/websocket` for the Go backend.
- **Hub Pattern**: Implement a `Hub` struct that maintains active clients and broadcasts messages to them.
- **FS Watcher**: Use `github.com/fsnotify/fsnotify` to monitor the file system. It will send events to the Hub.
- **Message Format**: Simple JSON format: `{ "type": "FS_EVENT", "payload": { "op": "CREATE", "path": "/..." } }`.
- **Frontend Hook**: `useWebSocket` will handle the native `WebSocket` API, including heartbeats (ping/pong) and exponential backoff for reconnection.

## Risks / Trade-offs

- **[Risk]**: `fsnotify` can produce many events for a single logical operation (e.g., large file upload).
    - **Mitigation**: Implement a small debouncing or throttling mechanism in the backend event producer.
- **[Risk]**: Performance impact of watching a very large directory tree.
    - **Mitigation**: Limit recursive watching depth or selectively watch active paths if performance becomes an issue.
