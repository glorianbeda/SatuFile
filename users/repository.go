package users

import (
	"errors"

	"gorm.io/gorm"
)

var (
	ErrUserNotFound = errors.New("user not found")
	ErrUserExists   = errors.New("user already exists")
)

// Repository provides user database operations
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new user repository
func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Migrate runs database migrations for users table
func (r *Repository) Migrate() error {
	return r.db.AutoMigrate(&User{})
}

// Create creates a new user
func (r *Repository) Create(user *User) error {
	// Check if username exists
	var existing User
	err := r.db.Where("username = ?", user.Username).First(&existing).Error
	if err == nil {
		return ErrUserExists
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	return r.db.Create(user).Error
}

// GetByID finds a user by ID
func (r *Repository) GetByID(id uint) (*User, error) {
	var user User
	err := r.db.First(&user, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrUserNotFound
	}
	return &user, err
}

// GetByUsername finds a user by username
func (r *Repository) GetByUsername(username string) (*User, error) {
	var user User
	err := r.db.Where("username = ?", username).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrUserNotFound
	}
	return &user, err
}

// GetByEmail finds a user by email
func (r *Repository) GetByEmail(email string) (*User, error) {
	var user User
	err := r.db.Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrUserNotFound
	}
	return &user, err
}

// Update updates an existing user
func (r *Repository) Update(user *User) error {
	return r.db.Save(user).Error
}

// Delete soft-deletes a user
func (r *Repository) Delete(id uint) error {
	return r.db.Delete(&User{}, id).Error
}

// List returns all users
func (r *Repository) List() ([]User, error) {
	var users []User
	err := r.db.Find(&users).Error
	return users, err
}

// Count returns the number of users
func (r *Repository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&User{}).Count(&count).Error
	return count, err
}

// CreateAdmin creates an admin user if none exists
func (r *Repository) CreateAdmin(username, password string) error {
	// Check if any admin exists (GORM embeds Permissions.Admin as column 'admin')
	var count int64
	r.db.Model(&User{}).Where("admin = ?", true).Count(&count)
	if count > 0 {
		return nil // Admin already exists
	}

	hashedPwd, err := HashPassword(password)
	if err != nil {
		return err
	}

	admin := &User{
		Username:           username,
		Password:           hashedPwd,
		Scope:              "/",
		MustChangePassword: true, // Force first-time password change
		Perm: Permissions{
			Admin:    true,
			Execute:  true,
			Create:   true,
			Rename:   true,
			Modify:   true,
			Delete:   true,
			Share:    true,
			Download: true,
		},
	}

	return r.db.Create(admin).Error
}
