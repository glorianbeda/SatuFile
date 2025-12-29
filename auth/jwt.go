package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"github.com/satufile/satufile/users"
)

const (
	// DefaultTokenExpiration is the default JWT token expiration time
	DefaultTokenExpiration = time.Hour * 2
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
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for a user
func GenerateToken(user *users.User, expiration time.Duration) (string, error) {
	if expiration == 0 {
		expiration = DefaultTokenExpiration
	}

	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		IsAdmin:  user.Perm.Admin,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    DefaultIssuer,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
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
