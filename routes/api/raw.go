package api

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"

	"github.com/satufile/satufile/auth"
)

// RawGet handles GET /api/raw/{path:.*} - stream file content for download
func RawGet(deps *Deps) http.HandlerFunc {
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

		fullPath := filepath.Join(effectiveRoot, path)

		// Security: ensure path is within effectiveRoot
		cleanPath := filepath.Clean(fullPath)
		if !strings.HasPrefix(cleanPath, filepath.Clean(effectiveRoot)) {
			http.Error(w, "Invalid path", http.StatusBadRequest)
			return
		}

		// Check if file exists
		info, err := os.Stat(fullPath)
		if err != nil {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}

		// Cannot download directories
		if info.IsDir() {
			http.Error(w, "Cannot download directory", http.StatusBadRequest)
			return
		}

		// Open file
		file, err := os.Open(fullPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Set headers for download
		filename := filepath.Base(fullPath)
		w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"\"")
		w.Header().Set("Content-Type", getContentType(fullPath))
		w.Header().Set("Content-Length", string(rune(info.Size())))

		// Stream file
		io.Copy(w, file)
	}
}

// getContentType returns the MIME type for a file
func getContentType(path string) string {
	ext := strings.ToLower(filepath.Ext(path))

	mimeTypes := map[string]string{
		// Images
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
		".svg":  "image/svg+xml",
		// Documents
		".pdf":  "application/pdf",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		// Audio
		".mp3": "audio/mpeg",
		".wav": "audio/wav",
		".ogg": "audio/ogg",
		// Video
		".mp4":  "video/mp4",
		".webm": "video/webm",
		".avi":  "video/x-msvideo",
		// Text
		".txt":  "text/plain",
		".html": "text/html",
		".css":  "text/css",
		".js":   "application/javascript",
		".json": "application/json",
		// Archives
		".zip": "application/zip",
		".rar": "application/x-rar-compressed",
		".7z":  "application/x-7z-compressed",
	}

	if mime, ok := mimeTypes[ext]; ok {
		return mime
	}
	return "application/octet-stream"
}
