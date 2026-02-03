package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/satufile/satufile/users"
)

// ContextKey is the type for context keys
type ContextKey string

const (
	// UserContextKey is the key for user in context
	UserContextKey ContextKey = "user"
	// ClaimsContextKey is the key for claims in context
	ClaimsContextKey ContextKey = "claims"
)

// SetupWhitelist contains routes that bypass setup check
var SetupWhitelist = map[string]bool{
	"/api/setup/status":    true,
	"/api/setup/password":  true,
	"/api/setup/drives":    true,
	"/api/setup/partition": true,
	"/api/setup/complete":  true,
	"/api/me":              true,
}

// extractToken extracts JWT from request
func extractToken(r *http.Request) string {
	var token string

	// Check Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			token = parts[1]
		} else if len(parts) == 1 {
			// Handle clients that might send only the token or without Bearer prefix
			if strings.Count(parts[0], ".") == 2 {
				token = parts[0]
			}
		}
	}

	// Check X-Auth header if no token yet
	if token == "" {
		xAuth := r.Header.Get("X-Auth")
		if strings.Count(xAuth, ".") == 2 {
			token = xAuth
		}
	}

	// Check cookie if no token yet
	if token == "" {
		if cookie, err := r.Cookie("auth"); err == nil {
			if strings.Count(cookie.Value, ".") == 2 {
				token = cookie.Value
			}
		}
	}

	return strings.TrimSpace(token)
}

// authenticate handles the core authentication logic
func authenticate(userRepo *users.Repository, r *http.Request) (*users.User, *Claims, error) {
	tokenString := extractToken(r)
	if tokenString == "" {
		return nil, nil, http.ErrNoCookie
	}

	claims, err := ValidateToken(tokenString)
	if err != nil {
		return nil, nil, err
	}

	user, err := userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, nil, err
	}

	return user, claims, nil
}

// Middleware creates an authentication middleware
func Middleware(userRepo *users.Repository, required bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, claims, err := authenticate(userRepo, r)

			if err != nil {
				if required {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			// Add user and claims to context
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			ctx = context.WithValue(ctx, ClaimsContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuth is middleware that requires authentication and checks setup status
func RequireAuth(userRepo *users.Repository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, claims, err := authenticate(userRepo, r)

			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Check if setup is required
			if user.ForceSetup || user.IsDefaultPassword {
				// Check if route is whitelisted
				if !isSetupWhitelisted(r) {
					// For API requests, return 403 Forbidden with JSON
					if strings.HasPrefix(r.URL.Path, "/api/") {
						w.Header().Set("Content-Type", "application/json")
						w.WriteHeader(http.StatusForbidden)
						json.NewEncoder(w).Encode(map[string]string{
							"error": "setup_required",
							"step":  user.SetupStep,
						})
						return
					}

					// For frontend routes, return 302 redirect to setup
					http.Redirect(w, r, "/setup", http.StatusFound)
					return
				}
			}

			// Add user and claims to context
			ctx := context.WithValue(r.Context(), UserContextKey, user)
			ctx = context.WithValue(ctx, ClaimsContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// isSetupWhitelisted checks if the current route bypasses setup check
func isSetupWhitelisted(r *http.Request) bool {
	path := r.URL.Path
	// Check exact match
	if SetupWhitelist[path] {
		return true
	}
	// Check prefix match for /api/setup/*
	if strings.HasPrefix(path, "/api/setup/") {
		return true
	}
	// Check frontend setup routes
	if strings.HasPrefix(path, "/setup") {
		return true
	}
	return false
}

// OptionalAuth is middleware that optionally authenticates
func OptionalAuth(userRepo *users.Repository) func(http.Handler) http.Handler {
	return Middleware(userRepo, false)
}

// RequireAdmin is middleware that requires admin privileges
func RequireAdmin(userRepo *users.Repository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return RequireAuth(userRepo)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := GetUserFromContext(r.Context())
			if user == nil || !user.Perm.Admin {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		}))
	}
}

// GetUserFromContext retrieves user from context
func GetUserFromContext(ctx context.Context) *users.User {
	user, ok := ctx.Value(UserContextKey).(*users.User)
	if !ok {
		return nil
	}
	return user
}

// GetClaimsFromContext retrieves claims from context
func GetClaimsFromContext(ctx context.Context) *Claims {
	claims, ok := ctx.Value(ClaimsContextKey).(*Claims)
	if !ok {
		return nil
	}
	return claims
}
