package uploads

import (
	"gorm.io/gorm"
)

// Storage implements StorageBackend using GORM
type Storage struct {
	db *gorm.DB
}

// NewStorage creates a new upload storage backend
func NewStorage(db *gorm.DB) (*Storage, error) {
	// Auto-migrate the schema
	if err := db.AutoMigrate(&Session{}); err != nil {
		return nil, err
	}
	return &Storage{db: db}, nil
}

// CreateSession creates a new upload session
func (s *Storage) CreateSession(session *Session) error {
	return s.db.Create(session).Error
}

// GetSession retrieves an upload session by ID
func (s *Storage) GetSession(id string) (*Session, error) {
	var session Session
	err := s.db.Where("id = ?", id).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// UpdateSession updates an upload session
func (s *Storage) UpdateSession(session *Session) error {
	return s.db.Save(session).Error
}

// DeleteSession deletes an upload session
func (s *Storage) DeleteSession(id string) error {
	return s.db.Where("id = ?", id).Delete(&Session{}).Error
}

// ListExpiredSessions returns all expired sessions
func (s *Storage) ListExpiredSessions() ([]*Session, error) {
	var sessions []*Session
	err := s.db.Where("expires_at < ?", gorm.Expr("datetime('now')")).Find(&sessions).Error
	return sessions, err
}
