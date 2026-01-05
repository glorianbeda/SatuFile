# Tasks: Setup Project Scaffold

## 1. Backend Setup (Go)

### 1.1 Project Initialization
- [x] 1.1.1 Create `go.mod` with module `github.com/satufile/satufile`
- [x] 1.1.2 Create `main.go` entry point following filebrowser pattern
- [x] 1.1.3 Install core dependencies: gorilla/mux, cobra, viper

### 1.2 Directory Structure
- [x] 1.2.1 Create `cmd/` directory with `root.go` for CLI
- [x] 1.2.2 Create `http/` directory with `http.go` for routing
- [x] 1.2.3 Create `settings/` for configuration
- [x] 1.2.4 Create `storage/` for database abstraction

### 1.3 HTTP Server
- [x] 1.3.1 Setup Gorilla Mux router in `http/http.go`
- [x] 1.3.2 Add `/health` endpoint for basic check
- [x] 1.3.3 Add `/api` prefix for API routes
- [x] 1.3.4 Configure static file serving for frontend

---

## 2. Frontend Setup (React + MUI)

### 2.1 Project Initialization
- [x] 2.1.1 Initialize Vite React-TS project in `frontend/`
- [x] 2.1.2 Install Material UI and dependencies
- [x] 2.1.3 Install React Router, Axios
- [x] 2.1.4 Configure TypeScript strict mode

### 2.2 Directory Structure
- [x] 2.2.1 Create `components/common/` for reusable UI
- [x] 2.2.2 Create `features/` for feature modules
- [x] 2.2.3 Create `hooks/` for custom hooks
- [x] 2.2.4 Create `contexts/` for React Context
- [x] 2.2.5 Create `api/` for API client
- [x] 2.2.6 Create `types/` for TypeScript interfaces
- [x] 2.2.7 Create `utils/` for helpers

### 2.3 Core Components
- [x] 2.3.1 Create `ThemeProvider` with MUI theme
- [x] 2.3.2 Create `Layout` component (header, sidebar placeholder)
- [x] 2.3.3 Create base `Button`, `Card` components as reusable examples
- [x] 2.3.4 Setup React Router with placeholder routes

### 2.4 API Client
- [x] 2.4.1 Create `api/client.ts` with Axios instance
- [x] 2.4.2 Add request/response interceptors
- [x] 2.4.3 Create typed API hooks pattern

---

## 3. Integration

### 3.1 Build Process
- [x] 3.1.1 Configure Vite output to `frontend/dist/`
- [x] 3.1.2 Embed frontend assets in Go binary (placeholder created)
- [x] 3.1.3 Serve embedded files from Go HTTP server

### 3.2 Development Workflow
- [x] 3.2.1 Add `Taskfile.yml` for common commands
- [x] 3.2.2 Configure dev proxy (Vite → Go backend)
- [x] 3.2.3 Add `.gitignore` rules

---

## 4. Verification
- [x] 4.1 Run `go build` successfully
- [x] 4.2 Run `npm run build` in frontend successfully
- [x] 4.3 Binary responds to `--help`
- [x] 4.4 Frontend dist generated with index.html and assets
