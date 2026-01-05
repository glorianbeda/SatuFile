package http

import (
	"io/fs"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"

	"github.com/satufile/satufile/routes"
	"github.com/satufile/satufile/settings"
	"github.com/satufile/satufile/storage"
	"github.com/satufile/satufile/users"
)

// NewHandler creates a main HTTP handler with all routes
func NewHandler(cfg *settings.Config, userRepo *users.Repository, storageBackend *storage.Storage) http.Handler {
	r := mux.NewRouter()

	// Global middleware
	r.Use(securityHeaders)
	r.Use(corsMiddleware)

	// Register file-based routes
	routes.RegisterRoutes(r, userRepo, cfg.Root, storageBackend.Share)

	// Static files (frontend) - SPA handler
	r.PathPrefix("/").Handler(spaHandler("frontend/dist"))

	return r
}

// NewHandlerWithAssets creates handler with embedded frontend assets
func NewHandlerWithAssets(cfg *settings.Config, userRepo *users.Repository, storageBackend *storage.Storage, assets fs.FS) http.Handler {
	r := mux.NewRouter()

	r.Use(securityHeaders)
	r.Use(corsMiddleware)

	// Register file-based routes
	routes.RegisterRoutes(r, userRepo, cfg.Root, storageBackend.Share)

	// Serve embedded frontend assets
	r.PathPrefix("/").Handler(http.FileServer(http.FS(assets)))

	return r
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		// Allow credentials requires specific origin, not wildcard
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Auth")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Security-Policy", `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';`)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		next.ServeHTTP(w, r)
	})
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
