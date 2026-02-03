package http

import (
	"io/fs"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/satufile/satufile/middleware"
	"github.com/satufile/satufile/routes"
	"github.com/satufile/satufile/settings"
	"github.com/satufile/satufile/storage"
	"github.com/satufile/satufile/users"
)

// NewHandler creates a main HTTP handler with all routes
func NewHandler(cfg *settings.Config, userRepo *users.Repository, storageBackend *storage.Storage) http.Handler {
	r := mux.NewRouter()

	// Global middleware
	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.CORSMiddleware)
	r.Use(middleware.GlobalRateLimit)

	// Register file-based routes
	routes.RegisterRoutes(r, userRepo, cfg.Root, storageBackend.Share, storageBackend.Uploads)

	// Static files (frontend) - SPA handler
	r.PathPrefix("/").Handler(spaHandler("frontend/dist"))

	return r
}

// NewHandlerWithAssets creates handler with embedded frontend assets
func NewHandlerWithAssets(cfg *settings.Config, userRepo *users.Repository, storageBackend *storage.Storage, assets fs.FS) http.Handler {
	r := mux.NewRouter()

	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.CORSMiddleware)
	r.Use(middleware.GlobalRateLimit)

	// Register file-based routes
	routes.RegisterRoutes(r, userRepo, cfg.Root, storageBackend.Share, storageBackend.Uploads)

	// Serve embedded frontend assets
	r.PathPrefix("/").Handler(http.FileServer(http.FS(assets)))

	return r
}

// spaHandler serves static files and falls back to index.html for SPA routing
func spaHandler(staticPath string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join(staticPath, r.URL.Path)

		// Check if file exists
		_, err := os.Stat(path)
		if os.IsNotExist(err) {
			// Serve index.html for SPA routing
			http.ServeFile(w, r, filepath.Join(staticPath, "index.html"))
			return
		}

		// Serve file directly
		http.FileServer(http.Dir(staticPath)).ServeHTTP(w, r)
	})
}
