package api

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/satufile/satufile/files"
)

// SharePublicGetResponse is JSON response for share info
type SharePublicGetResponse struct {
	Token     string `json:"token"`
	Path      string `json:"path"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	Size      int64  `json:"size"`
	ExpiresAt string `json:"expires_at"`
	Expires   string `json:"expires"` // Alias for frontend compatibility
	IsDir     bool   `json:"isDir"`
}

// SharePublicGet handles GET /api/share/public
// Serves file content for public share links
// Query params:
//   - token: the share token (required)
//   - download: if "true", forces download as attachment
//   - subpath: path within shared folder (optional, for folder shares)
func SharePublicGet(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			http.Error(w, "Missing token", http.StatusBadRequest)
			return
		}

		// Get share link
		link, err := deps.Share.GetLink(token)
		if err != nil {
			http.Error(w, "Invalid or expired share link", http.StatusNotFound)
			return
		}

		// Handle subpath for folder shares
		subpath := r.URL.Query().Get("subpath")
		targetPath := link.Path
		if subpath != "" && link.Type == "folder" {
			// Sanitize subpath to prevent directory traversal
			subpath = filepath.Clean(subpath)
			if strings.HasPrefix(subpath, "..") {
				http.Error(w, "Invalid subpath", http.StatusBadRequest)
				return
			}
			targetPath = filepath.Join(link.Path, subpath)
		}

		// Get file info for the target path
		fileInfo, err := files.NewFileInfo(root, targetPath)
		if err != nil {
			http.Error(w, "File not found", http.StatusNotFound)
			return
		}

		// Check if download is requested
		forceDownload := r.URL.Query().Get("download") == "true"

		// If it's a folder and not downloading, return folder contents or info
		if fileInfo.IsDir && !forceDownload {
			// Return folder listing
			listing, err := files.ReadDir(root, targetPath, true)
			if err != nil {
				http.Error(w, "Failed to read directory", http.StatusInternalServerError)
				return
			}

			expiresStr := link.ExpiresAt.Format("2006-01-02T15:04:05Z07:00")
			response := struct {
				Token     string            `json:"token"`
				Path      string            `json:"path"`
				Name      string            `json:"name"`
				Type      string            `json:"type"`
				ExpiresAt string            `json:"expires_at"`
				Expires   string            `json:"expires"`
				IsDir     bool              `json:"isDir"`
				Subpath   string            `json:"subpath,omitempty"`
				Items     []*files.FileInfo `json:"items"`
				NumDirs   int               `json:"numDirs"`
				NumFiles  int               `json:"numFiles"`
			}{
				Token:     link.Token,
				Path:      link.Path,
				Name:      fileInfo.Name,
				Type:      link.Type,
				ExpiresAt: expiresStr,
				Expires:   expiresStr,
				IsDir:     true,
				Subpath:   subpath,
				Items:     listing.Items,
				NumDirs:   listing.NumDirs,
				NumFiles:  listing.NumFiles,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
			return
		}

		// If no download param and it's a file, return JSON info about the share
		if !forceDownload {
			expiresStr := link.ExpiresAt.Format("2006-01-02T15:04:05Z07:00")
			response := SharePublicGetResponse{
				Token:     link.Token,
				Path:      link.Path,
				Name:      fileInfo.Name,
				Type:      link.Type,
				Size:      fileInfo.Size,
				ExpiresAt: expiresStr,
				Expires:   expiresStr,
				IsDir:     fileInfo.IsDir,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)
			return
		}

		// Handle download based on file type
		if fileInfo.IsDir {
			// Stream folder as ZIP
			zipName := fileInfo.Name + ".zip"
			w.Header().Set("Content-Type", "application/zip")
			w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", zipName))

			zw := zip.NewWriter(w)
			defer zw.Close()

			baseDir := filepath.Join(root, targetPath)
			err := filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}

				// Skip the root folder itself
				if path == baseDir {
					return nil
				}

				// Create header
				header, err := zip.FileInfoHeader(info)
				if err != nil {
					return err
				}

				// Set relative path
				relPath, err := filepath.Rel(baseDir, path)
				if err != nil {
					return err
				}
				header.Name = relPath

				if info.IsDir() {
					header.Name += "/"
				} else {
					header.Method = zip.Deflate
				}

				writer, err := zw.CreateHeader(header)
				if err != nil {
					return err
				}

				if info.IsDir() {
					return nil
				}

				file, err := os.Open(path)
				if err != nil {
					return err
				}
				defer file.Close()

				_, err = io.Copy(writer, file)
				return err
			})

			if err != nil {
				// Log error? We can't write to response as we've already started streaming
				return
			}
			return
		}

		// Serve file as attachment (force download)
		filePath := filepath.Join(root, targetPath)

		// Detect content type
		ext := strings.ToLower(filepath.Ext(filePath))
		contentType := mime.TypeByExtension(ext)
		if contentType == "" {
			contentType = "application/octet-stream"
		}

		// Set headers for download
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("Content-Disposition", "attachment; filename=\""+filepath.Base(filePath)+"\"")

		http.ServeFile(w, r, filePath)
	}
}

// StreamFile serves a file with proper content-type headers
func StreamFile(w http.ResponseWriter, r *http.Request, filePath string) {
	// Detect content type
	ext := strings.ToLower(filepath.Ext(filePath))
	contentType := mime.TypeByExtension(ext)

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	// Set headers
	w.Header().Set("Content-Type", contentType)

	// Check if file should be served inline or as attachment
	inlineMimeTypes := []string{
		"text/",
		"image/",
		"video/",
		"audio/",
		"application/pdf",
		"application/json",
	}

	inline := false
	for _, mimePrefix := range inlineMimeTypes {
		if strings.HasPrefix(contentType, mimePrefix) {
			inline = true
			break
		}
	}

	if inline {
		w.Header().Set("Content-Disposition", "inline; filename=\""+filepath.Base(filePath)+"\"")
	} else {
		w.Header().Set("Content-Disposition", "attachment; filename=\""+filepath.Base(filePath)+"\"")
	}

	// Open and serve file
	file, err := http.Dir(filepath.Dir(filePath)).Open(filepath.Base(filePath))
	if err != nil {
		http.Error(w, "Failed to open file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		http.Error(w, "Failed to get file info", http.StatusInternalServerError)
		return
	}

	http.ServeContent(w, r, filepath.Base(filePath), stat.ModTime(), file.(io.ReadSeeker))
}
