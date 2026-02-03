package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/satufile/satufile/users"
)

const (
	// DefaultTokenExpiration is the default JWT token expiration time (reduced for security)
	DefaultTokenExpiration = time.Hour * 1
	// DefaultIssuer is the JWT issuer
	DefaultIssuer = "SatuFile"
)

var (
	// SecretKey should be set from environment or config
	SecretKey = []byte("satufile-secret-key-change-in-production")

	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

// Claims represents the JWT claims structure
type Claims struct {
	UserID   uint   `json:"userId"`
	Username string `json:"username"`
	IsAdmin  bool   `json:"isAdmin"`
	// OriginalIssuedAt tracks the very first login in a chain of renewals
	OriginalIssuedAt int64 `json:"oia,omitempty"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(user *users.User, expiration time.Duration) (string, error) {
	return GenerateTokenWithOIA(user, expiration, 0)
}

// GenerateTokenWithOIA creates a new JWT token with an optional original issued at timestamp
func GenerateTokenWithOIA(user *users.User, expiration time.Duration, oia int64) (string, error) {
	if expiration == 0 {
		expiration = DefaultTokenExpiration
	}

	now := time.Now()
	if oia == 0 {
		oia = now.Unix()
	}

	claims := &Claims{
		UserID:           user.ID,
		Username:         user.Username,
		IsAdmin:          user.Perm.Admin,
		OriginalIssuedAt: oia,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    DefaultIssuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(expiration)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(SecretKey)
}

// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return SecretKey, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// SetSecretKey sets the JWT secret key
func SetSecretKey(key string) {
	SecretKey = []byte(key)
}
