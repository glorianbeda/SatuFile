package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/satufile/satufile/auth"
	"github.com/satufile/satufile/storage"
	"github.com/satufile/satufile/trash"
)

// TrashGet handles GET /api/trash
func TrashGet(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var items []trash.TrashItem
		if err := storage.GetDB().Order("deleted_at desc").Find(&items).Error; err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
	}
}

// TrashRestore handles POST /api/trash/{id}/restore
func TrashRestore(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		idStr := vars["id"]
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		tx := storage.GetDB().Begin()

		var item trash.TrashItem
		if err := tx.First(&item, id).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Item not found", http.StatusNotFound)
			return
		}

		// Restore file
		effectiveRoot := user.StoragePath
		trashPath := filepath.Join(effectiveRoot, ".trash", fmt.Sprintf("%d", item.ID))
		originalPath := filepath.Join(effectiveRoot, item.OriginalPath)

		// Check if original path exists
		if _, err := os.Stat(originalPath); err == nil {
			// Conflict handling: rename restored file
			// Simple strategy: append timestamp
			ext := filepath.Ext(item.OriginalPath)
			name := strings.TrimSuffix(filepath.Base(item.OriginalPath), ext)
			newName := fmt.Sprintf("%s_%d%s", name, time.Now().Unix(), ext)
			originalPath = filepath.Join(filepath.Dir(originalPath), newName)
		}

		// Ensure parent dir exists
		if err := os.MkdirAll(filepath.Dir(originalPath), 0755); err != nil {
			tx.Rollback()
			http.Error(w, "Failed to create directory", http.StatusInternalServerError)
			return
		}

		if err := os.Rename(trashPath, originalPath); err != nil {
			tx.Rollback()
			http.Error(w, "Failed to restore file: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Delete from DB
		if err := tx.Delete(&item).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		tx.Commit()
		w.WriteHeader(http.StatusOK)
	}
}

// TrashDelete handles DELETE /api/trash/{id} (permanent delete)
func TrashDelete(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		vars := mux.Vars(r)
		idStr := vars["id"]
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		tx := storage.GetDB().Begin()

		var item trash.TrashItem
		if err := tx.First(&item, id).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Item not found", http.StatusNotFound)
			return
		}

		// Delete file from .trash
		effectiveRoot := user.StoragePath
		trashPath := filepath.Join(effectiveRoot, ".trash", fmt.Sprintf("%d", item.ID))

		if err := os.RemoveAll(trashPath); err != nil && !os.IsNotExist(err) {
			tx.Rollback()
			http.Error(w, "Failed to delete file: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Delete from DB
		if err := tx.Delete(&item).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		tx.Commit()
		w.WriteHeader(http.StatusNoContent)
	}
}

// TrashEmpty handles DELETE /api/trash (empty all)
func TrashEmpty(deps *Deps) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := auth.GetUserFromContext(r.Context())
		if user == nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tx := storage.GetDB().Begin()

		// Get all items
		var items []trash.TrashItem
		if err := tx.Find(&items).Error; err != nil {
			tx.Rollback()
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		effectiveRoot := user.StoragePath
		trashDir := filepath.Join(effectiveRoot, ".trash")

		// Delete all files
		for _, item := range items {
			trashPath := filepath.Join(trashDir, fmt.Sprintf("%d", item.ID))
			os.RemoveAll(trashPath) // Ignore errors, best effort
		}

		// Truncate table
		if err := tx.Exec("DELETE FROM trash_items").Error; err != nil {
			tx.Rollback()
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		tx.Commit()
		w.WriteHeader(http.StatusNoContent)
	}
}
