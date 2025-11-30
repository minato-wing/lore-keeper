package database

import (
	"os"

	"github.com/supabase-community/supabase-go"
)

var Client *supabase.Client

func InitSupabase() error {
	url := os.Getenv("SUPABASE_URL")
	// Use service role key for backend operations
	serviceKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	client, err := supabase.NewClient(url, serviceKey, nil)
	if err != nil {
		return err
	}

	Client = client
	return nil
}
