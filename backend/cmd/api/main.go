package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/handlers"
	"github.com/minato-wing/lore-keeper/backend/internal/middleware"
	"github.com/minato-wing/lore-keeper/backend/internal/services"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := database.InitSupabase(); err != nil {
		log.Fatal("Failed to initialize Supabase:", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	campaignHandler := handlers.NewCampaignHandler()
	characterHandler := handlers.NewCharacterHandler()
	relationshipHandler := handlers.NewRelationshipHandler()
	loreEntryHandler := handlers.NewLoreEntryHandler()
	aiService := services.NewAIService()

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			campaigns := protected.Group("/campaigns")
			{
				campaigns.GET("", campaignHandler.GetCampaigns)
				campaigns.GET("/:id", campaignHandler.GetCampaign)
				campaigns.POST("", campaignHandler.CreateCampaign)
				campaigns.PUT("/:id", campaignHandler.UpdateCampaign)
				campaigns.DELETE("/:id", campaignHandler.DeleteCampaign)
			}

			characters := protected.Group("/characters")
			{
				characters.GET("", characterHandler.GetCharacters)
				characters.GET("/:id", characterHandler.GetCharacter)
				characters.POST("", characterHandler.CreateCharacter)
				characters.PUT("/:id", characterHandler.UpdateCharacter)
				characters.DELETE("/:id", characterHandler.DeleteCharacter)
			}

			relationships := protected.Group("/relationships")
			{
				relationships.GET("", relationshipHandler.GetRelationships)
				relationships.POST("", relationshipHandler.CreateRelationship)
				relationships.PUT("/:id", relationshipHandler.UpdateRelationship)
				relationships.DELETE("/:id", relationshipHandler.DeleteRelationship)
			}

			loreEntries := protected.Group("/lore-entries")
			{
				loreEntries.GET("", loreEntryHandler.GetLoreEntries)
				loreEntries.GET("/:id", loreEntryHandler.GetLoreEntry)
				loreEntries.POST("", loreEntryHandler.CreateLoreEntry)
				loreEntries.PUT("/:id", loreEntryHandler.UpdateLoreEntry)
				loreEntries.DELETE("/:id", loreEntryHandler.DeleteLoreEntry)
			}

			ai := protected.Group("/ai")
			{
				ai.POST("/deep-dive", func(c *gin.Context) {
					var req struct {
						Input map[string]interface{} `json:"input" binding:"required"`
					}
					if err := c.ShouldBindJSON(&req); err != nil {
						c.JSON(400, gin.H{"error": err.Error()})
						return
					}

					suggestions, err := aiService.GenerateDeepDive(req.Input)
					if err != nil {
						c.JSON(500, gin.H{"error": err.Error()})
						return
					}

					c.JSON(200, gin.H{"suggestions": suggestions})
				})

				ai.POST("/consistency-check", func(c *gin.Context) {
					var req struct {
						CampaignID string `json:"campaign_id" binding:"required"`
						NewContent string `json:"new_content" binding:"required"`
					}
					if err := c.ShouldBindJSON(&req); err != nil {
						c.JSON(400, gin.H{"error": err.Error()})
						return
					}

					var loreEntries []struct {
						Content string `json:"content"`
					}
					_, err := database.Client.DB.From("lore_entries").
						Select("content", "", false).
						Eq("campaign_id", req.CampaignID).
						Execute(&loreEntries)

					if err != nil {
						c.JSON(500, gin.H{"error": err.Error()})
						return
					}

					existingLore := make([]string, len(loreEntries))
					for i, entry := range loreEntries {
						existingLore[i] = entry.Content
					}

					isConsistent, warnings, err := aiService.CheckConsistency(req.NewContent, existingLore)
					if err != nil {
						c.JSON(500, gin.H{"error": err.Error()})
						return
					}

					c.JSON(200, gin.H{
						"is_consistent": isConsistent,
						"warnings":      warnings,
					})
				})
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
