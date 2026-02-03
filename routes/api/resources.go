package api

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/files"
	"github.com/satufile/satufile/system/partition"
)

// ResourceGet handles GET /api/resources/{path:.*}
func ResourceGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Use user's storage path if set, otherwise reject
		effectiveRoot := user.StoragePath
		if effectiveRoot == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{
				"error":   "setup_required",
				"message": "Storage not initialized. Please complete setup.",
			})
			return
		}

		// Get path from URL and sanitize it
		vars := mux.Vars(r)
		path := filepath.Clean("/" + vars["path"])
		if strings.HasPrefix(path, "..") {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}

		// Get file/dir info
		info, err := files.NewFileInfo(effectiveRoot, path)
		if err != nil {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}

		// Verify the resolved path is still within effectiveRoot
		fullPath := filepath.Join(effectiveRoot, path)
		if !strings.HasPrefix(fullPath, filepath.Clean(effectiveRoot)) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		// If directory, list contents
		if info.IsDir {
			hideDotfiles := user.HideDotfiles
			listing, err := files.ReadDir(effectiveRoot, path, hideDotfiles)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Check share status for each item
			links, _ := deps.Share.ListLinks()

			// Create a map of shared paths for O(1) lookup
			shareMap := make(map[string]bool)
			folderShares := []string{}

			for _, link := range links {
				linkPath := filepath.Clean(link.Path)
				shareMap[linkPath] = true

				if link.Type == "folder" {
					folderShares = append(folderShares, linkPath)
				}
			}

			// Update isShared for each item
			for _, item := range listing.Items {
				itemPath := filepath.Clean(item.Path)

				// 1. Direct match
				if shareMap[itemPath] {
					item.IsShared = true
					continue
				}

				// 2. Parent folder match
				for _, sharePath := range folderShares {
					if strings.HasPrefix(itemPath, sharePath+string(os.PathSeparator)) || itemPath == sharePath {
						item.IsShared = true
						break
					}
				}
			}

			// Apply sorting
			sortBy := r.URL.Query().Get("sort")
			sortAsc := r.URL.Query().Get("order") != "desc"
			if sortBy == "" {
				sortBy = "name"
			}
			listing.ApplySort(files.Sorting{By: sortBy, Asc: sortAsc})

			json.NewEncoder(w).Encode(map[string]interface{}{
				"path":     path,
				"name":     info.Name,
				"isDir":    true,
				"items":    listing.Items,
				"numDirs":  listing.NumDirs,
				"numFiles": listing.NumFiles,
			})
			return
		}

		// Check if single file is shared
		links, _ := deps.Share.ListLinks()
		cleanPath := filepath.Clean(path)
		for _, link := range links {
			if filepath.Clean(link.Path) == cleanPath {
				info.IsShared = true
				break
			}
		}

		// Single file info
		json.NewEncoder(w).Encode(info)
	}
}

// ResourcePost handles POST /api/resources/{path:.*} (upload/create)
func ResourcePost(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Use user's storage path if set, otherwise reject
		effectiveRoot := user.StoragePath
		if effectiveRoot == "" {
			http.Error(w, "Storage not initialized", http.StatusForbidden)
			return
		}

		vars := mux.Vars(r)
		path := filepath.Clean("/" + vars["path"])
		if strings.HasPrefix(path, "..") {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}

		// If path ends with /, create directory
		if strings.HasSuffix(vars["path"], "/") {
			fullPath := filepath.Join(effectiveRoot, path)
			if err := os.MkdirAll(fullPath, 0755); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{
				"message": "Directory created",
				"path":    path,
			})
			return
		}

		// Otherwise, handle file upload
		fullPath := filepath.Join(effectiveRoot, path)

		// Verify path safety
		if !strings.HasPrefix(fullPath, filepath.Clean(effectiveRoot)) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}

		// Check quota before saving (if file size is known from Content-Length)
		if r.ContentLength > 0 {
			if err := partition.CheckQuota(effectiveRoot, user.StorageAllocationGb, r.ContentLength); err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusRequestEntityTooLarge)
				json.NewEncoder(w).Encode(map[string]string{
					"error":   "quota_exceeded",
					"message": err.Error(),
				})
				return
			}
		}

		// Ensure parent directory exists
		if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Create destination file
		dst, err := os.Create(fullPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Copy from request body to file
		_, err = io.Copy(dst, r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		info, _ := files.NewFileInfo(effectiveRoot, path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(info)
	}
}

// CoreFolders that cannot be deleted
var CoreFolders = []string{
	"Documents",
	"Pictures",
	"Videos",
	"Audio",
	"Downloads",
}

// IsCoreFolder checks if a path is a protected core folder
func IsCoreFolder(path string) bool {
	cleanPath := strings.Trim(path, "/")
	for _, folder := range CoreFolders {
		if cleanPath == folder {
			return true
		}
	}
	return false
}

// ResourceDelete handles DELETE /api/resources/{path:.*}
func ResourceDelete(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Use user's storage path if set, otherwise reject
		effectiveRoot := user.StoragePath
		if effectiveRoot == "" {
			http.Error(w, "Storage not initialized", http.StatusForbidden)
			return
		}

		vars := mux.Vars(r)
		path := filepath.Clean("/" + vars["path"])
		if strings.HasPrefix(path, "..") {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}

		if path == "/" {
			http.Error(w, "Cannot delete root", http.StatusForbidden)
			return
		}

		// Check if trying to delete a core folder
		if IsCoreFolder(path) {
			http.Error(w, "Cannot delete protected folder", http.StatusForbidden)
			return
		}

		fullPath := filepath.Join(effectiveRoot, path)

		// Verify path safety
		if !strings.HasPrefix(fullPath, filepath.Clean(effectiveRoot)) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}

		if err := os.RemoveAll(fullPath); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// RenameRequest represents the rename request body
type RenameRequest struct {
	NewName string `json:"newName"`
}

// ResourcePatch handles PATCH /api/resources/{path:.*} (rename)
func ResourcePatch(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Use user's storage path if set, otherwise reject
		effectiveRoot := user.StoragePath
		if effectiveRoot == "" {
			http.Error(w, "Storage not initialized", http.StatusForbidden)
			return
		}

		vars := mux.Vars(r)
		path := filepath.Clean("/" + vars["path"])
		if strings.HasPrefix(path, "..") {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}

		if path == "/" {
			http.Error(w, "Cannot rename root", http.StatusForbidden)
			return
		}

		// Check if trying to rename a core folder
		if IsCoreFolder(path) {
			http.Error(w, "Cannot rename protected folder", http.StatusForbidden)
			return
		}

		// Parse request body
		var req RenameRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.NewName == "" {
			http.Error(w, "New name is required", http.StatusBadRequest)
			return
		}

		// Validate new name
		if strings.ContainsAny(req.NewName, "/\\:*?\"<>|") {
			http.Error(w, "Invalid characters in name", http.StatusBadRequest)
			return
		}

		oldPath := filepath.Join(effectiveRoot, path)
		newPath := filepath.Join(filepath.Dir(oldPath), req.NewName)

		// Verify path safety
		if !strings.HasPrefix(oldPath, filepath.Clean(effectiveRoot)) || !strings.HasPrefix(newPath, filepath.Clean(effectiveRoot)) {
			http.Error(w, "Access denied", http.StatusForbidden)
			return
		}

		// Check if target already exists
		if _, err := os.Stat(newPath); err == nil {
			http.Error(w, "A file or folder with that name already exists", http.StatusConflict)
			return
		}

		// Rename
		if err := os.Rename(oldPath, newPath); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Return new file info
		newFilePath := filepath.Join(filepath.Dir(path), req.NewName)
		info, _ := files.NewFileInfo(effectiveRoot, newFilePath)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(info)
	}
}