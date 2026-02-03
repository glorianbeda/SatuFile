## 1. Backend Infrastructure

- [x] 1.1 Implement WebSocket Hub in `http/hub.go` to manage connections and broadcasts
- [x] 1.2 Implement `fsnotify` watcher in `http/watcher.go` to monitor root data directory
- [x] 1.3 Add `/api/ws` endpoint handler in `http/http.go`
- [x] 1.4 Integrate Hub and Watcher into `main.go` / `cmd/root.go`

## 2. Frontend Infrastructure

- [x] 2.1 Create reusable `useWebSocket` hook in `frontend/src/hooks/useWebSocket.ts`
- [x] 2.2 Implement reconnection logic and heartbeat in the hook

## 3. Real-time Integration

- [x] 3.1 Integrate `useWebSocket` into `frontend/src/features/files/HomePage.tsx`
- [x] 3.2 Implement logic to trigger `fetchFiles()` when `FS_EVENT` is received for current path

## 4. Verification

- [x] 4.1 Verify WebSocket connection is established on login
- [x] 4.2 Verify automatic refresh when creating a file externally (e.g., via terminal)
- [x] 4.3 Verify automatic refresh when renaming/deleting a file externally
- [x] 4.4 Verify hook auto-reconnects when server is restarted
