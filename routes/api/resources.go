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
)

// ResourceGet handles GET /api/resources/{path:.*}
func ResourceGet(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Get path from URL
		vars := mux.Vars(r)
		path := "/" + vars["path"]
		if path == "/" {
			path = "/"
		}

		// Get file/dir info
		info, err := files.NewFileInfo(root, path)
		if err != nil {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		// If directory, list contents
		if info.IsDir {
			hideDotfiles := user.HideDotfiles
			listing, err := files.ReadDir(root, path, hideDotfiles)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Check share status for each item
			links, _ := deps.Share.ListLinks()
			shareMap := make(map[string]bool)
			for _, link := range links {
				shareMap[link.Path] = true
				// For folder shares, mark all items in the folder as shared
				if link.Type == "folder" {
					for _, item := range listing.Items {
						if strings.HasPrefix(item.Path, link.Path) {
							shareMap[item.Path] = true
						}
					}
				}
			}

			// Update isShared for each item
			for _, item := range listing.Items {
				item.IsShared = shareMap[item.Path]
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
		for _, link := range links {
			if link.Path == path {
				info.IsShared = true
				break
			}
		}

		// Single file info
		json.NewEncoder(w).Encode(info)
	}
}

// ResourcePost handles POST /api/resources/{path:.*} (upload/create)
func ResourcePost(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		path := "/" + vars["path"]

		// If path ends with /, create directory
		if strings.HasSuffix(path, "/") {
			fullPath := filepath.Join(root, path)
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
		// Read file directly from request body (like filebrowser approach)
		// This is more efficient for large files - no multipart parsing needed
		fullPath := filepath.Join(root, path)

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

		info, _ := files.NewFileInfo(root, path)
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
func ResourceDelete(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		path := "/" + vars["path"]
		if path == "/" {
			http.Error(w, "Cannot delete root", http.StatusForbidden)
			return
		}

		// Check if trying to delete a core folder
		if IsCoreFolder(path) {
			http.Error(w, "Cannot delete protected folder", http.StatusForbidden)
			return
		}

		fullPath := filepath.Join(root, path)
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
func ResourcePatch(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		path := "/" + vars["path"]
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

		oldPath := filepath.Join(root, path)
		newPath := filepath.Join(filepath.Dir(oldPath), req.NewName)

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
		info, _ := files.NewFileInfo(root, newFilePath)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(info)
	}
}
