# Tasks: Add Navigation and Protected Folders

## 1. Frontend: Navigation UI

- [x] 1.1 Create `Breadcrumb.tsx` component
- [x] 1.2 Add back button to `FolderToolbar`
- [x] 1.3 Update `HomePage` to show current path
- [x] 1.4 Add navigation handlers (breadcrumb click, back)

---

## 2. Backend: Protected Folders

- [x] 2.1 Define core folders constant (Documents, Pictures, Videos, Audio, Downloads)
- [x] 2.2 Update `resources.delete.go` to reject core folder deletion
- [x] 2.3 Add startup hook to create core folders if missing

---

## 3. Docker Deployment

- [x] 3.1 Create `docker-compose.yml`
- [x] 3.2 Update `README.md` with installation guide
- [x] 3.3 Add Dockerfile if missing

---

## 4. Verification

- [x] 4.1 Go build passes
- [x] 4.2 Frontend build passes
- [x] 4.3 Breadcrumb shows correct path
- [x] 4.4 Back button works
- [x] 4.5 Core folders cannot be deleted
- [x] 4.6 Docker compose works
