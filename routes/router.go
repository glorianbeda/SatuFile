package routes

import (
	"github.com/gorilla/mux"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/middleware"
	"github.com/satufile/satufile/routes/api"
	"github.com/satufile/satufile/share"
	"github.com/satufile/satufile/uploads"
	"github.com/satufile/satufile/users"
)

// RegisterRoutes registers all file-based routes
//
// Route naming convention:
//
//	routes/api/login.post.go  → POST /api/login
//	routes/api/me.get.go      → GET /api/me
//	routes/api/users/[id].get.go → GET /api/users/{id}
//	routes/health.get.go      → GET /health
//
// Add new routes by creating a file in routes/ directory
// with the pattern: {name}.{method}.go
func RegisterRoutes(r *mux.Router, userRepo *users.Repository, root string, shareStorage share.StorageBackend, uploadsStorage uploads.StorageBackend) {
	// API dependencies
	apiDeps := &api.Deps{
		UserRepo: userRepo,
		Share:    shareStorage,
		Uploads:  uploadsStorage,
		DataDir:  root,
	}

	// ===== Public Routes =====
	r.HandleFunc("/health", HealthGet()).Methods("GET")

	// API subrouter
	apiRouter := r.PathPrefix("/api").Subrouter()

	// Public API routes
	apiRouter.HandleFunc("/info", api.InfoGet(apiDeps)).Methods("GET")
	
	// Apply LoginRateLimit to login
	apiRouter.Handle("/login", middleware.LoginRateLimit(api.LoginPost(apiDeps))).Methods("POST")
	
	apiRouter.HandleFunc("/share/public", api.SharePublicGet(apiDeps, root)).Methods("GET") // Public share access

	// ===== Protected Routes =====
	protectedAPI := apiRouter.NewRoute().Subrouter()
	protectedAPI.Use(auth.RequireAuth(userRepo))
	protectedAPI.HandleFunc("/renew", api.RenewPost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/me", api.MeGet(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/me", api.UpdateProfilePut(apiDeps)).Methods("PUT")
	protectedAPI.HandleFunc("/change-password", api.ChangePasswordPost(apiDeps)).Methods("POST")

	// ===== Add new routes below =====
	// Resource routes (file operations)
	protectedAPI.HandleFunc("/resources", api.ResourceGet(apiDeps, root)).Methods("GET")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourceGet(apiDeps, root)).Methods("GET")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourcePost(apiDeps, root)).Methods("POST")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourceDelete(apiDeps, root)).Methods("DELETE")
	protectedAPI.HandleFunc("/resources/{path:.*}", api.ResourcePatch(apiDeps, root)).Methods("PATCH")

	// Raw file download
	protectedAPI.HandleFunc("/raw/{path:.*}", api.RawGet(apiDeps, root)).Methods("GET")

	// Storage usage
	protectedAPI.HandleFunc("/storage", api.StorageGet(apiDeps, root)).Methods("GET")

	// Share endpoints
	protectedAPI.HandleFunc("/share", api.SharePost(apiDeps)).Methods("POST")
	protectedAPI.HandleFunc("/share", api.SharePut(apiDeps)).Methods("PUT")
	protectedAPI.HandleFunc("/share", api.ShareDelete(apiDeps)).Methods("DELETE")
	protectedAPI.HandleFunc("/shares", api.SharesGet(apiDeps)).Methods("GET")

	// Upload endpoints (resumable uploads)
	protectedAPI.HandleFunc("/uploads", api.UploadCreate(apiDeps, root)).Methods("POST")
	protectedAPI.HandleFunc("/uploads/{id}", api.UploadChunk(apiDeps, root)).Methods("PATCH")
	protectedAPI.HandleFunc("/uploads/{id}", api.UploadProgress(apiDeps)).Methods("GET")
	protectedAPI.HandleFunc("/uploads/{id}", api.UploadCancel(apiDeps)).Methods("DELETE")
}
