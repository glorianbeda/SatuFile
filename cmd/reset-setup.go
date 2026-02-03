package cmd

import (
	"fmt"
	"log"

	"github.com/satufile/satufile/storage"
	"github.com/satufile/satufile/users"
	"github.com/spf13/cobra"
)

var resetSetupCmd = &cobra.Command{
	Use:   "reset-setup [username]",
	Short: "Reset user to trigger first-time setup flow",
	Long: `Reset a user to trigger the first-time setup flow.
This sets forceSetup=true and isDefaultPassword=true so the user
will be prompted to change password and configure storage.`,
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		username := args[0]

		// Connect to database
		cfg := storage.DefaultConfig()
		if err := storage.Connect(cfg); err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		defer storage.Close()

		// Get user repository
		userRepo := users.NewRepository(storage.GetDB())

		// Find user
		user, err := userRepo.GetByUsername(username)
		if err != nil {
			log.Fatalf("User not found: %s", username)
		}

		// Reset setup flags
		user.ForceSetup = true
		user.SetupStep = "password"
		user.IsDefaultPassword = true

		if err := userRepo.Update(user); err != nil {
			log.Fatalf("Failed to update user: %v", err)
		}

		fmt.Printf("✓ User '%s' has been reset to setup mode\n", username)
		fmt.Printf("  - forceSetup: true\n")
		fmt.Printf("  - setupStep: password\n")
		fmt.Printf("  - isDefaultPassword: true\n")
		fmt.Println("\nThe user will now see the setup wizard on next login.")
	},
}

func init() {
	rootCmd.AddCommand(resetSetupCmd)
}
