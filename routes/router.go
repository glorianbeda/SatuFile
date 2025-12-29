package routes

import (
	"github.com/gorilla/mux"

	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/routes/api"
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
func RegisterRoutes(r *mux.Router, userRepo *users.Repository, root string) {
	// API dependencies
	apiDeps := &api.Deps{UserRepo: userRepo}

	// ===== Public Routes =====
	r.HandleFunc("/health", HealthGet()).Methods("GET")

	// API subrouter
	apiRouter := r.PathPrefix("/api").Subrouter()

	// Public API routes
	apiRouter.HandleFunc("/info", api.InfoGet(apiDeps)).Methods("GET")
	apiRouter.HandleFunc("/login", api.LoginPost(apiDeps)).Methods("POST")
	apiRouter.HandleFunc("/signup", api.SignupPost(apiDeps)).Methods("POST")

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
}
