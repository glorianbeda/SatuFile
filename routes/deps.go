package routes

import (
	"github.com/satufile/satufile/users"
)

// Dependencies holds shared dependencies for route handlers
type Dependencies struct {
	UserRepo *users.Repository
}

// NewDependencies creates new route dependencies
func NewDependencies(userRepo *users.Repository) *Dependencies {
	return &Dependencies{
		UserRepo: userRepo,
	}
}
