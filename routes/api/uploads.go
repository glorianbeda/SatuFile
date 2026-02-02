package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/uploads"
)

const (
	DefaultChunkSize = 5 * 1024 * 1024 // 5MB chunks
	SessionExpiry    = 24 * time.Hour  // Clean up after 24h
)

// UploadCreate handles POST /api/uploads - create upload session
func UploadCreate(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req struct {
			Filename string `json:"filename"`
			Path     string `json:"path"`
			Size     int64  `json:"size"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if req.Filename == "" || req.Path == "" || req.Size <= 0 {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		// Generate session ID
		sessionID := generateID()

		// Create temp directory for chunks
		tempDir := filepath.Join(os.TempDir(), "satufile-uploads", sessionID)
		if err := os.MkdirAll(tempDir, 0755); err != nil {
			http.Error(w, "Failed to create temp directory", http.StatusInternalServerError)
			return
		}

		// Calculate chunks
		chunkSize := int64(DefaultChunkSize)
		totalChunks := int(math.Ceil(float64(req.Size) / float64(chunkSize)))

		session := &uploads.Session{
			ID:             sessionID,
			Filename:       req.Filename,
			Path:           req.Path,
			TotalSize:      req.Size,
			UploadedSize:   0,
			ChunkSize:      chunkSize,
			TotalChunks:    totalChunks,
			UploadedChunks: 0,
			Status:         "uploading",
			TempDir:        tempDir,
			ExpiresAt:      time.Now().Add(SessionExpiry),
		}

		if err := deps.Uploads.CreateSession(session); err != nil {
			http.Error(w, "Failed to create session", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(session)
	}
}

// UploadChunk handles PATCH /api/uploads/{id} - upload chunk
func UploadChunk(deps *Deps, root string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		sessionID := vars["id"]

		// Get chunk index from query param
		chunkIndexStr := r.URL.Query().Get("chunk")
		if chunkIndexStr == "" {
			http.Error(w, "Missing chunk index", http.StatusBadRequest)
			return
		}

		chunkIndex, err := strconv.Atoi(chunkIndexStr)
		if err != nil {
			http.Error(w, "Invalid chunk index", http.StatusBadRequest)
			return
		}

		// Get session
		session, err := deps.Uploads.GetSession(sessionID)
		if err != nil {
			http.Error(w, "Session not found", http.StatusNotFound)
			return
		}

		// Check if session expired
		if time.Now().After(session.ExpiresAt) {
			http.Error(w, "Session expired", http.StatusGone)
			return
		}

		// Write chunk to temp file
		chunkPath := filepath.Join(session.TempDir, fmt.Sprintf("chunk_%d", chunkIndex))

		// Check if chunk already exists (for idempotent resume)
		chunkAlreadyExists := false
		if _, err := os.Stat(chunkPath); err == nil {
			chunkAlreadyExists = true
		}

		chunkFile, err := os.Create(chunkPath)
		if err != nil {
			http.Error(w, "Failed to create chunk file", http.StatusInternalServerError)
			return
		}
		defer chunkFile.Close()

		written, err := io.Copy(chunkFile, r.Body)
		if err != nil {
			http.Error(w, "Failed to write chunk", http.StatusInternalServerError)
			return
		}

		// Validate chunk size
		if chunkIndex < session.TotalChunks-1 {
			// Non-terminal chunks must be exactly ChunkSize
			if written != session.ChunkSize {
				os.Remove(chunkPath) // Cleanup invalid chunk
				http.Error(w, fmt.Sprintf("Invalid chunk size: expected %d, got %d", session.ChunkSize, written), http.StatusBadRequest)
				return
			}
		} else {
			// Last chunk must not exceed ChunkSize
			if written > session.ChunkSize {
				os.Remove(chunkPath) // Cleanup invalid chunk
				http.Error(w, "Invalid chunk size: exceeds chunk size", http.StatusBadRequest)
				return
			}
		}

		// Update session only if this is a new chunk
		if !chunkAlreadyExists {
			session.UploadedChunks++
			session.UploadedSize += written
		}

		// Check if all chunks uploaded
		if session.UploadedChunks >= session.TotalChunks {
			// Final size verification
			if session.UploadedSize != session.TotalSize {
				http.Error(w, fmt.Sprintf("Upload corrupted: expected total size %d, got %d", session.TotalSize, session.UploadedSize), http.StatusInternalServerError)
				return
			}

			// Assemble file
			finalPath := filepath.Join(root, session.Path)
			if err := os.MkdirAll(filepath.Dir(finalPath), 0755); err != nil {
				http.Error(w, "Failed to create directory", http.StatusInternalServerError)
				return
			}

			finalFile, err := os.Create(finalPath)
			if err != nil {
				http.Error(w, "Failed to create final file", http.StatusInternalServerError)
				return
			}
			defer finalFile.Close()

			// Assemble chunks in order
			for i := 0; i < session.TotalChunks; i++ {
				chunkPath := filepath.Join(session.TempDir, fmt.Sprintf("chunk_%d", i))
				chunk, err := os.Open(chunkPath)
				if err != nil {
					http.Error(w, fmt.Sprintf("Failed to open chunk %d", i), http.StatusInternalServerError)
					return
				}

				if _, err := io.Copy(finalFile, chunk); err != nil {
					chunk.Close()
					http.Error(w, "Failed to assemble file", http.StatusInternalServerError)
					return
				}
				chunk.Close()
			}

			// Update status
			session.Status = "completed"

			// Cleanup temp directory
			os.RemoveAll(session.TempDir)
		}

		if err := deps.Uploads.UpdateSession(session); err != nil {
			http.Error(w, "Failed to update session", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session)
	}
}

// UploadProgress handles GET /api/uploads/{id} - get upload progress
func UploadProgress(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		sessionID := vars["id"]

		session, err := deps.Uploads.GetSession(sessionID)
		if err != nil {
			http.Error(w, "Session not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(session)
	}
}

// UploadCancel handles DELETE /api/uploads/{id} - cancel and cleanup
func UploadCancel(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		sessionID := vars["id"]

		session, err := deps.Uploads.GetSession(sessionID)
		if err != nil {
			http.Error(w, "Session not found", http.StatusNotFound)
			return
		}

		// Cleanup temp directory
		if session.TempDir != "" {
			os.RemoveAll(session.TempDir)
		}

		// Delete session from database
		if err := deps.Uploads.DeleteSession(sessionID); err != nil {
			http.Error(w, "Failed to delete session", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// generateID generates a random session ID
func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
