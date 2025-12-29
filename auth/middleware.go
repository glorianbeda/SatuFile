package auth

import (
	"context"
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

// Middleware creates an authentication middleware
func Middleware(userRepo *users.Repository, required bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenString := extractToken(r)

			if tokenString == "" {
				if required {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			claims, err := ValidateToken(tokenString)
			if err != nil {
				if required {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					return
				}
				next.ServeHTTP(w, r)
				return
			}

			// Get user from database
			user, err := userRepo.GetByID(claims.UserID)
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

// RequireAuth is middleware that requires authentication
func RequireAuth(userRepo *users.Repository) func(http.Handler) http.Handler {
	return Middleware(userRepo, true)
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

// extractToken extracts JWT from request
func extractToken(r *http.Request) string {
	// Check Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			return parts[1]
		}
	}

	// Check X-Auth header (filebrowser compatibility)
	xAuth := r.Header.Get("X-Auth")
	if xAuth != "" && strings.Count(xAuth, ".") == 2 {
		return xAuth
	}

	// Check cookie
	cookie, err := r.Cookie("auth")
	if err == nil && strings.Count(cookie.Value, ".") == 2 {
		return cookie.Value
	}

	return ""
}
