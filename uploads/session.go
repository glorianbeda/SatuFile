package uploads

import (
	"time"
)

// Session represents an upload session for resumable uploads
type Session struct {
	ID             string    `json:"id" gorm:"primaryKey"`
	Filename       string    `json:"filename" gorm:"not null"`
	Path           string    `json:"path" gorm:"not null"` // Target path
	TotalSize      int64     `json:"total_size" gorm:"not null"`
	UploadedSize   int64     `json:"uploaded_size" gorm:"default:0"`
	ChunkSize      int64     `json:"chunk_size" gorm:"not null"` // Size of each chunk
	TotalChunks    int       `json:"total_chunks" gorm:"not null"`
	UploadedChunks int       `json:"uploaded_chunks" gorm:"default:0"`
	Status         string    `json:"status" gorm:"default:'uploading'"` // uploading, paused, completed, failed
	TempDir        string    `json:"temp_dir" gorm:"not null"`          // Temporary directory for chunks
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	ExpiresAt      time.Time `json:"expires_at" gorm:"index"` // Auto-cleanup after 24h
}

// StorageBackend defines interface for upload session storage
type StorageBackend interface {
	CreateSession(session *Session) error
	GetSession(id string) (*Session, error)
	UpdateSession(session *Session) error
	DeleteSession(id string) error
	ListExpiredSessions() ([]*Session, error)
}

// Ensure table name
func (Session) TableName() string {
	return "upload_sessions"
}
