package trash

import (
	"time"
)

type TrashItem struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	OriginalPath string    `json:"original_path" gorm:"not null"`
	DeletedAt    time.Time `json:"deleted_at" gorm:"autoCreateTime"`
	FileSize     int64     `json:"file_size"`
	IsDirectory  bool      `json:"is_directory"`
	Name         string    `json:"name"`
}
