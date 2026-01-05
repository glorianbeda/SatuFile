package share

import (
	"errors"
	"sync"
	"time"

	"gorm.io/gorm"
)

// MemoryStorage implements StorageBackend in memory
type MemoryStorage struct {
	mu    sync.RWMutex
	links map[string]*Link
}

// NewMemoryStorage creates a new in-memory storage
func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		links: make(map[string]*Link),
	}
}

func (s *MemoryStorage) CreateLink(link *Link) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.links[link.Token] = link
	return nil
}

func (s *MemoryStorage) GetLink(token string) (*Link, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	link, exists := s.links[token]
	if !exists {
		return nil, errors.New("share link not found")
	}

	if link.ExpiresAt.Before(time.Now()) {
		delete(s.links, token)
		return nil, errors.New("share link expired")
	}

	return link, nil
}

func (s *MemoryStorage) DeleteLink(token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.links, token)
	return nil
}

func (s *MemoryStorage) ListLinks() ([]*Link, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var links []*Link
	for _, link := range s.links {
		links = append(links, link)
	}
	return links, nil
}

func (s *MemoryStorage) UpdateLink(token string, expiresAt time.Time) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	link, exists := s.links[token]
	if !exists {
		return errors.New("share link not found")
	}
	link.ExpiresAt = expiresAt
	return nil
}

// DBStorage implements StorageBackend using database
type DBStorage struct {
	db *gorm.DB
}

// NewDBStorage creates a new database storage for share links
func NewDBStorage(db *gorm.DB) *DBStorage {
	return &DBStorage{db: db}
}

// CreateLink creates a new share link in database
func (s *DBStorage) CreateLink(link *Link) error {
	if s.db == nil {
		return errors.New("database not initialized")
	}
	return s.db.Create(link).Error
}

// GetLink retrieves a share link by token
func (s *DBStorage) GetLink(token string) (*Link, error) {
	if s.db == nil {
		return nil, errors.New("database not initialized")
	}

	var link Link
	err := s.db.Where("token = ?", token).First(&link).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("share link not found")
		}
		return nil, err
	}

	// Check if expired
	if link.ExpiresAt.Before(time.Now()) {
		// Delete expired link
		s.DeleteLink(token)
		return nil, errors.New("share link expired")
	}

	return &link, nil
}

// DeleteLink removes a share link from the database
func (s *DBStorage) DeleteLink(token string) error {
	if s.db == nil {
		return errors.New("database not initialized")
	}
	return s.db.Where("token = ?", token).Delete(&Link{}).Error
}

// ListLinks returns all share links
func (s *DBStorage) ListLinks() ([]*Link, error) {
	if s.db == nil {
		return nil, errors.New("database not initialized")
	}

	var links []*Link
	now := time.Now()

	err := s.db.Find(&links).Error
	if err != nil {
		return nil, err
	}

	// Filter out expired links
	var validLinks []*Link
	for _, link := range links {
		if link.ExpiresAt.After(now) {
			validLinks = append(validLinks, link)
		}
	}

	return validLinks, nil
}

// UpdateLink updates a share link's expiration time
func (s *DBStorage) UpdateLink(token string, expiresAt time.Time) error {
	if s.db == nil {
		return errors.New("database not initialized")
	}
	result := s.db.Model(&Link{}).Where("token = ?", token).Update("expires_at", expiresAt)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("share link not found")
	}
	return nil
}
