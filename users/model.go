package users

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	Username           string         `gorm:"uniqueIndex;not null;size:50" json:"username"`
	Password           string         `gorm:"not null" json:"-"` // Never serialize password
	Email              string         `gorm:"uniqueIndex;size:255" json:"email,omitempty"`
	Scope              string         `gorm:"default:'/'" json:"scope"`
	Locale             string         `gorm:"default:'en'" json:"locale"`
	ViewMode           string         `gorm:"default:'list'" json:"viewMode"`
	HideDotfiles       bool           `gorm:"default:false" json:"hideDotfiles"`
	SingleClick        bool           `gorm:"default:false" json:"singleClick"`
	MustChangePassword bool           `gorm:"default:false" json:"mustChangePassword"`
	Perm               Permissions    `gorm:"embedded" json:"perm"`
	
	// Lockout fields
	FailedAttempts     int            `gorm:"default:0" json:"-"`
	LockedUntil        *time.Time     `json:"-"`
	
	CreatedAt          time.Time      `json:"createdAt"`
	UpdatedAt          time.Time      `json:"updatedAt"`
	DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
}

// LoginAttempt tracks login history for security auditing and brute force protection
type LoginAttempt struct {
	ID        uint      `gorm:"primaryKey"`
	Username  string    `gorm:"index;size:50"`
	IP        string    `gorm:"index;size:50"`
	Success   bool      `gorm:"index"`
	CreatedAt time.Time `gorm:"index"`
}

// Permissions defines what actions a user can perform
type Permissions struct {
	Admin    bool `gorm:"default:false" json:"admin"`
	Execute  bool `gorm:"default:false" json:"execute"`
	Create   bool `gorm:"default:true" json:"create"`
	Rename   bool `gorm:"default:true" json:"rename"`
	Modify   bool `gorm:"default:true" json:"modify"`
	Delete   bool `gorm:"default:true" json:"delete"`
	Share    bool `gorm:"default:true" json:"share"`
	Download bool `gorm:"default:true" json:"download"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}

// UserInfo is a safe representation of user for API responses
type UserInfo struct {
	ID                 uint        `json:"id"`
	Username           string      `json:"username"`
	Email              string      `json:"email,omitempty"`
	Scope              string      `json:"scope"`
	Locale             string      `json:"locale"`
	ViewMode           string      `json:"viewMode"`
	HideDotfiles       bool        `json:"hideDotfiles"`
	SingleClick        bool        `json:"singleClick"`
	MustChangePassword bool        `json:"mustChangePassword"`
	Perm               Permissions `json:"perm"`
	CreatedAt          time.Time   `json:"createdAt"`
}

// ToInfo converts User to UserInfo (safe for API)
func (u *User) ToInfo() *UserInfo {
	return &UserInfo{
		ID:                 u.ID,
		Username:           u.Username,
		Email:              u.Email,
		Scope:              u.Scope,
		Locale:             u.Locale,
		ViewMode:           u.ViewMode,
		HideDotfiles:       u.HideDotfiles,
		SingleClick:        u.SingleClick,
		MustChangePassword: u.MustChangePassword,
		Perm:               u.Perm,
		CreatedAt:          u.CreatedAt,
	}
}
