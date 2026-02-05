package api

import (
	"encoding/json"
	"errors"
	"io/fs"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/files"
)

var ErrLimitReached = errors.New("limit reached")

// SearchGet handles GET /api/search
func SearchGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Use user's storage path
		effectiveRoot := user.StoragePath
		if effectiveRoot == "" {
			http.Error(w, "Storage not initialized", http.StatusForbidden)
			return
		}

		query := strings.ToLower(r.URL.Query().Get("q"))
		if len(query) < 2 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"results": []files.FileInfo{},
			})
			return
		}

		results := []files.FileInfo{}
		count := 0

		err := filepath.WalkDir(effectiveRoot, func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return nil // Ignore errors accessing specific files
			}

			// Skip root
			if path == effectiveRoot {
				return nil
			}

			// Get relative path for display and checking
			relPath, err := filepath.Rel(effectiveRoot, path)
			if err != nil {
				return nil
			}

			// Skip .trash folder explicitly
			if d.IsDir() && d.Name() == ".trash" {
				return fs.SkipDir
			}
			
			// Also skip any path starting with .trash (double check)
			if strings.HasPrefix(relPath, ".trash") {
				return fs.SkipDir
			}

			// Perform match (case-insensitive)
			if strings.Contains(strings.ToLower(d.Name()), query) {
				info, err := files.NewFileInfo(effectiveRoot, "/" + relPath)
				if err == nil {
					results = append(results, *info)
					count++
					if count >= 50 {
						return ErrLimitReached
					}
				}
			}

			return nil
		})

		if err != nil && err != ErrLimitReached {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"results": results,
		})
	}
}
