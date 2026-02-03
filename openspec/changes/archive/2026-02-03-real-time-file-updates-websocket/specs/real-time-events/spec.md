## ADDED Requirements

### Requirement: WebSocket Hub
The system SHALL provide a centralized WebSocket hub to manage active connections and broadcast system events.

#### Scenario: Client connects
- **GIVEN** the WebSocket server is running
- **WHEN** a client connects to `/api/ws`
- **THEN** the connection is upgraded to WebSocket
- **AND** the client is registered in the Hub

### Requirement: File System Event Broadcasting
The system SHALL broadcast file system events (Create, Write, Rename, Delete) to all connected WebSocket clients.

#### Scenario: Broadcast CREATE event
- **GIVEN** a client is connected via WebSocket
- **WHEN** a new file is created in the data directory
- **THEN** the system sends a JSON message to the client: `{ "type": "FS_EVENT", "payload": { "op": "CREATE", "path": "..." } }`

### Requirement: Reusable WebSocket Hook
The frontend SHALL provide a reusable `useWebSocket` hook to manage connection lifecycle and message handling.

#### Scenario: Hook auto-reconnects
- **GIVEN** a component uses `useWebSocket`
- **WHEN** the WebSocket connection is lost
- **THEN** the hook attempts to reconnect with exponential backoff
