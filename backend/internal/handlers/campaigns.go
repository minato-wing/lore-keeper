package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
)

type CampaignHandler struct{}

func NewCampaignHandler() *CampaignHandler {
	return &CampaignHandler{}
}

func (h *CampaignHandler) GetCampaigns(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var campaigns []models.Campaign
	_, err := database.Client.DB.From("campaigns").
		Select("*", "", false).
		Eq("user_id", userID).
		Execute(&campaigns)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, campaigns)
}

func (h *CampaignHandler) GetCampaign(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	var campaign models.Campaign
	_, err := database.Client.DB.From("campaigns").
		Select("*", "", false).
		Eq("id", id).
		Eq("user_id", userID).
		Single().
		Execute(&campaign)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "campaign not found"})
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func (h *CampaignHandler) CreateCampaign(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	campaign := map[string]interface{}{
		"user_id":     userID,
		"title":       req.Title,
		"description": req.Description,
	}

	var result []models.Campaign
	_, err := database.Client.DB.From("campaigns").
		Insert(campaign, false, "", "", "").
		Execute(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create campaign"})
		return
	}

	c.JSON(http.StatusCreated, result[0])
}

func (h *CampaignHandler) UpdateCampaign(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	var req models.CreateCampaignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	update := map[string]interface{}{
		"title":       req.Title,
		"description": req.Description,
	}

	var result []models.Campaign
	_, err := database.Client.DB.From("campaigns").
		Update(update, "", "").
		Eq("id", id).
		Eq("user_id", userID).
		Execute(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "campaign not found"})
		return
	}

	c.JSON(http.StatusOK, result[0])
}

func (h *CampaignHandler) DeleteCampaign(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	_, err := database.Client.DB.From("campaigns").
		Delete("", "").
		Eq("id", id).
		Eq("user_id", userID).
		Execute(nil)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
