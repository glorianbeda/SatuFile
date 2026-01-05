package share

import (
	"crypto/rand"
	"encoding/base64"
	"time"
)

// Link represents a share link
type Link struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Token     string    `json:"token" gorm:"uniqueIndex;not null"`
	Path      string    `json:"path" gorm:"index;not null"`
	Type      string    `json:"type" gorm:"not null"` // "file" or "folder"
	ExpiresAt time.Time `json:"expires_at" gorm:"index"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	// Add more fields as needed: permissions, max downloads, etc.
}

// NewLink creates a new share link
func NewLink(path string, linkType string, expiresHours int) (*Link, error) {
	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	var expiresAt time.Time
	if expiresHours == 0 {
		// Permanent: 100 years
		expiresAt = time.Now().Add(100 * 365 * 24 * time.Hour)
	} else if expiresHours > 0 {
		// Custom expiration in hours
		expiresAt = time.Now().Add(time.Duration(expiresHours) * time.Hour)
	} else {
		// Default: 24 hours
		expiresAt = time.Now().Add(24 * time.Hour)
	}

	return &Link{
		ID:        generateID(),
		Token:     token,
		Path:      path,
		Type:      linkType,
		ExpiresAt: expiresAt,
		CreatedAt: time.Now(),
	}, nil
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func generateID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)[:16]
}

// StorageBackend defines the interface for share storage
type StorageBackend interface {
	CreateLink(link *Link) error
	GetLink(token string) (*Link, error)
	DeleteLink(token string) error
	ListLinks() ([]*Link, error)
	UpdateLink(token string, expiresAt time.Time) error
}
