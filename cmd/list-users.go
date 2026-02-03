package cmd

import (
	"fmt"
	"log"

	"github.com/satufile/satufile/storage"
	"github.com/satufile/satufile/users"
	"github.com/spf13/cobra"
)

var listUsersCmd = &cobra.Command{
	Use:   "list-users",
	Short: "List all users and their setup status",
	Run: func(cmd *cobra.Command, args []string) {
		// Connect to database
		cfg := storage.DefaultConfig()
		if err := storage.Connect(cfg); err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		defer storage.Close()

		// Get user repository
		userRepo := users.NewRepository(storage.GetDB())

		// Get all users
		allUsers, err := userRepo.List()
		if err != nil {
			log.Fatalf("Failed to get users: %v", err)
		}

		if len(allUsers) == 0 {
			fmt.Println("No users found.")
			return
		}

		// Print header
		fmt.Printf("%-20s %-12s %-12s %-12s %-12s\n", "Username", "Force Setup", "Setup Step", "Default Pwd", "Storage")
		fmt.Println("--------------------------------------------------------------------------------")

		for _, user := range allUsers {
			setupStatus := "✓"
			if user.ForceSetup {
				setupStatus = "→"
			}

			defaultPwd := "✓"
			if user.IsDefaultPassword {
				defaultPwd = "⚠"
			}

			storage := fmt.Sprintf("%d GB", user.StorageAllocationGb)
			if user.StorageAllocationGb == 0 {
				storage = "-"
			}

			fmt.Printf("%-20s %-12s %-12s %-12s %-12s\n",
				user.Username,
				setupStatus,
				user.SetupStep,
				defaultPwd,
				storage,
			)
		}

		fmt.Println("\nLegend:")
		fmt.Println("  Force Setup: → = Needs setup, ✓ = Completed")
		fmt.Println("  Default Pwd: ⚠ = Using default, ✓ = Changed")
	},
}

func init() {
	rootCmd.AddCommand(listUsersCmd)
}
