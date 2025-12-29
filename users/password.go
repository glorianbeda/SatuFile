package users

import (
	"errors"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const (
	// DefaultMinPasswordLength is the minimum password length
	DefaultMinPasswordLength = 8
	// DefaultBcryptCost is the bcrypt hashing cost
	DefaultBcryptCost = 10
)

var (
	ErrPasswordTooShort    = errors.New("password must be at least 8 characters")
	ErrPasswordNoUppercase = errors.New("password must contain at least 1 uppercase letter")
	ErrPasswordNoNumber    = errors.New("password must contain at least 1 number")
	ErrPasswordNoSymbol    = errors.New("password must contain at least 1 symbol")
	ErrPasswordMismatch    = errors.New("password mismatch")
)

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	if err := ValidatePasswordStrength(password); err != nil {
		return "", err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), DefaultBcryptCost)
	if err != nil {
		return "", err
	}

	return string(hash), nil
}

// CheckPassword compares a password with a hash
func CheckPassword(password, hash string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		return ErrPasswordMismatch
	}
	return nil
}

// ValidatePassword validates password requirements (legacy - use ValidatePasswordStrength)
func ValidatePassword(password string, minLength int) error {
	if minLength == 0 {
		minLength = DefaultMinPasswordLength
	}
	if len(password) < minLength {
		return ErrPasswordTooShort
	}
	return nil
}

// ValidatePasswordStrength validates password meets all strength requirements:
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 number
// - At least 1 symbol
func ValidatePasswordStrength(password string) error {
	if len(password) < DefaultMinPasswordLength {
		return ErrPasswordTooShort
	}

	var hasUpper, hasNumber, hasSymbol bool
	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsNumber(r):
			hasNumber = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSymbol = true
		}
	}

	if !hasUpper {
		return ErrPasswordNoUppercase
	}
	if !hasNumber {
		return ErrPasswordNoNumber
	}
	if !hasSymbol {
		return ErrPasswordNoSymbol
	}

	return nil
}
