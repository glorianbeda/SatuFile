package middleware

import (
	"net"
	"net/http"
	"sync"

	"golang.org/x/time/rate"
)

// visitor represents a client's rate limit state
type visitor struct {
	limiter  *rate.Limiter
}

var (
	visitors = make(map[string]*visitor)
	loginVisitors = make(map[string]*visitor)
	mu       sync.Mutex
)

// getVisitor returns a rate limiter for the given IP address
func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	v, exists := visitors[ip]
	if !exists {
		// Allow 100 requests per minute (approx 1.66 per second) with a burst of 50
		limiter := rate.NewLimiter(rate.Limit(100.0/60.0), 50)
		visitors[ip] = &visitor{limiter}
		return limiter
	}

	return v.limiter
}

// getLoginVisitor returns a stricter rate limiter for login attempts
func getLoginVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	v, exists := loginVisitors[ip]
	if !exists {
		// Allow 5 login attempts per minute with a burst of 3
		limiter := rate.NewLimiter(rate.Limit(5.0/60.0), 3)
		loginVisitors[ip] = &visitor{limiter}
		return limiter
	}

	return v.limiter
}

// GlobalRateLimit middleware limits the number of requests per IP
func GlobalRateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, _ := net.SplitHostPort(r.RemoteAddr)
		
		// Check Cloudflare header if available
		if cfIP := r.Header.Get("CF-Connecting-IP"); cfIP != "" {
			ip = cfIP
		} else if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			ip = forwarded
		}

		limiter := getVisitor(ip)
		if !limiter.Allow() {
			http.Error(w, http.StatusText(http.StatusTooManyRequests), http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// LoginRateLimit middleware applies stricter limits to the login endpoint
func LoginRateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip, _, _ := net.SplitHostPort(r.RemoteAddr)
		
		if cfIP := r.Header.Get("CF-Connecting-IP"); cfIP != "" {
			ip = cfIP
		} else if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			ip = forwarded
		}

		limiter := getLoginVisitor(ip)
		if !limiter.Allow() {
			http.Error(w, "Too many login attempts. Please try again later.", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// SecurityHeaders adds strict security headers to the response
func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Relaxed CSP to allow fonts, workers, images, and blob URLs for PDF viewer
		w.Header().Set("Content-Security-Policy", `default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; img-src 'self' data: blob:; worker-src 'self' blob: https://unpkg.com; connect-src 'self' blob:;`)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// If on HTTPS (common with Cloudflare Tunnel), add HSTS
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		
		next.ServeHTTP(w, r)
	})
}

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware(next http.Handler) http.Handler {
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
