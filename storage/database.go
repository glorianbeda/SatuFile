package storage

import (
	"log"
	"os"

	"github.com/satufile/satufile/share"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Config holds database configuration
type Config struct {
	Driver string // sqlite, mysql, postgres
	DSN    string // Data source name
}

// DefaultConfig returns default SQLite configuration
func DefaultConfig() *Config {
	return &Config{
		Driver: "sqlite",
		DSN:    "satufile.db",
	}
}

// Connect initializes the database connection
func Connect(cfg *Config) error {
	var err error

	switch cfg.Driver {
	case "sqlite":
		DB, err = gorm.Open(sqlite.Open(cfg.DSN), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	default:
		DB, err = gorm.Open(sqlite.Open(cfg.DSN), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	}

	if err != nil {
		return err
	}

	// Auto-migrate models
	err = DB.AutoMigrate(&share.Link{})
	if err != nil {
		log.Printf("Warning: failed to migrate share links: %v", err)
	}

	log.Printf("Database connected: %s (%s)", cfg.Driver, cfg.DSN)
	return nil
}

// Close closes the database connection
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// GetDBPath returns the default database path
func GetDBPath() string {
	home, _ := os.UserHomeDir()
	return home + "/.satufile/satufile.db"
}
