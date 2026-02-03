package cmd

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/satufile/satufile/auth"
	fbhttp "github.com/satufile/satufile/http"
	"github.com/satufile/satufile/settings"
	"github.com/satufile/satufile/storage"
	"github.com/satufile/satufile/users"
)

// CoreFolders that are auto-created on startup
var CoreFolders = []string{
	"Documents",
	"Pictures",
	"Videos",
	"Audio",
	"Downloads",
}

// createCoreFolders ensures core folders exist in the root directory
func createCoreFolders(root string) error {
	for _, folder := range CoreFolders {
		path := filepath.Join(root, folder)
		if err := os.MkdirAll(path, 0755); err != nil {
			return fmt.Errorf("failed to create %s: %w", folder, err)
		}
	}
	return nil
}

var (
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "satufile",
		Short: "SatuFile - A cloud drive web application",
		Long:  `SatuFile is a file browser web application inspired by filebrowser.`,
		RunE:  runServer,
	}
)

func init() {
	cobra.OnInitialize(initConfig)

	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.satufile.yaml)")
	rootCmd.Flags().StringP("address", "a", "0.0.0.0", "address to listen on")
	rootCmd.Flags().IntP("port", "p", 8080, "port to listen on")
	rootCmd.Flags().StringP("root", "r", ".", "root directory to serve")
	rootCmd.Flags().StringP("database", "d", "satufile.db", "database file path")
	rootCmd.Flags().String("jwt-secret", "", "JWT secret key (overrides environment variable)")

	viper.BindPFlag("address", rootCmd.Flags().Lookup("address"))
	viper.BindPFlag("port", rootCmd.Flags().Lookup("port"))
	viper.BindPFlag("root", rootCmd.Flags().Lookup("root"))
	viper.BindPFlag("database", rootCmd.Flags().Lookup("database"))
	viper.BindPFlag("jwt_secret", rootCmd.Flags().Lookup("jwt-secret"))
}

func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := os.UserHomeDir()
		if err != nil {
			log.Fatal(err)
		}
		viper.AddConfigPath(home)
		viper.AddConfigPath(".")
		viper.SetConfigName(".satufile")
		viper.SetConfigType("yaml")
	}

	viper.SetEnvPrefix("SATUFILE")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		log.Printf("Using config file: %s", viper.ConfigFileUsed())
	}
}

func runServer(cmd *cobra.Command, args []string) error {
	cfg := &settings.Config{
		Address: viper.GetString("address"),
		Port:    viper.GetInt("port"),
		Root:    viper.GetString("root"),
	}

	// Create core folders if they don't exist
	if err := createCoreFolders(cfg.Root); err != nil {
		log.Printf("Warning: %v", err)
	}

	// Initialize database
	dbCfg := &storage.Config{
		Driver: "sqlite",
		DSN:    viper.GetString("database"),
	}

	if err := storage.Connect(dbCfg); err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer storage.Close()

	// Initialize JWT secret
	jwtSecret := viper.GetString("jwt_secret")
	if jwtSecret != "" {
		auth.SetSecretKey(jwtSecret)
	} else if os.Getenv("SATUFILE_JWT_SECRET") != "" {
		auth.SetSecretKey(os.Getenv("SATUFILE_JWT_SECRET"))
	} else {
		log.Println("Warning: No JWT secret set. Using default development key. PLEASE SET SATUFILE_JWT_SECRET IN PRODUCTION!")
	}

	// Initialize storage backend
	storageBackend, err := storage.New()
	if err != nil {
		return fmt.Errorf("failed to create storage: %w", err)
	}

	// Initialize user repository
	userRepo := users.NewRepository(storage.GetDB())

	// Run migrations
	if err := userRepo.Migrate(); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Ensure admin user exists (v1.0 single-user deployment)
	count, _ := userRepo.Count()
	if count == 0 {
		log.Println("Creating default admin user (admin/Admin123!)")
		if err := userRepo.CreateAdmin("admin", "Admin123!"); err != nil {
			log.Printf("Warning: failed to create admin user: %v", err)
		}
	} else {
		// Verify admin exists even if count > 0
		_, err := userRepo.GetByUsername("admin")
		if err != nil {
			log.Printf("Warning: No admin user found, creating default admin")
			if err := userRepo.CreateAdmin("admin", "Admin123!"); err != nil {
				log.Printf("Warning: failed to create admin user: %v", err)
			}
		}
	}

	// Initialize WebSocket Hub
	hub := fbhttp.NewHub()
	go hub.Run()

	// Initialize FS Watcher
	watcher, err := fbhttp.NewWatcher(cfg.Root, hub)
	if err != nil {
		log.Printf("Warning: failed to initialize FS watcher: %v", err)
	} else {
		go watcher.Watch()
		defer watcher.Close()
	}

	// Create HTTP handler
	handler := fbhttp.NewHandler(cfg, userRepo, storageBackend, hub)

	addr := fmt.Sprintf("%s:%d", cfg.Address, cfg.Port)
	log.Printf("Starting SatuFile server on http://%s", addr)
	log.Printf("Database: %s", dbCfg.DSN)

	return http.ListenAndServe(addr, handler)
}

// Execute runs the root command
func Execute() error {
	return rootCmd.Execute()
}
