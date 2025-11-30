package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
	"github.com/minato-wing/lore-keeper/backend/pkg/utils"
)

type CharacterHandler struct{}

func NewCharacterHandler() *CharacterHandler {
	return &CharacterHandler{}
}

func (h *CharacterHandler) GetCharacters(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	campaignID := c.Query("campaign_id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "campaign_id is required"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err := database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", campaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "campaign not found or access denied"})
		return
	}

	var characters []models.Character
	_, err = database.Client.From("characters").
		Select("*", "", false).
		Eq("campaign_id", campaignID).
		ExecuteTo(&characters)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, characters)
}

func (h *CharacterHandler) GetCharacter(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	// Get character with campaign info to verify ownership
	var character models.Character
	_, err := database.Client.From("characters").
		Select("*", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&character)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", character.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	c.JSON(http.StatusOK, character)
}

func (h *CharacterHandler) CreateCharacter(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err := database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", req.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "campaign not found or access denied"})
		return
	}

	character := map[string]interface{}{
		"campaign_id": req.CampaignID,
		"name":        req.Name,
		"role":        req.Role,
		"attributes":  req.Attributes,
		"background":  req.Background,
	}

	var result []models.Character
	_, err = database.Client.From("characters").
		Insert(character, false, "", "", "").
		ExecuteTo(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create character"})
		return
	}

	c.JSON(http.StatusCreated, result[0])
}

func (h *CharacterHandler) UpdateCharacter(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	var req models.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get character to verify ownership
	var character models.Character
	_, err := database.Client.From("characters").
		Select("campaign_id", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&character)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", character.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	update := map[string]interface{}{
		"name":       req.Name,
		"role":       req.Role,
		"attributes": req.Attributes,
		"background": req.Background,
	}

	var result []models.Character
	_, err = database.Client.From("characters").
		Update(update, "", "").
		Eq("id", id).
		ExecuteTo(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	c.JSON(http.StatusOK, result[0])
}

func (h *CharacterHandler) DeleteCharacter(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	// Get character to verify ownership
	var character models.Character
	_, err := database.Client.From("characters").
		Select("campaign_id", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&character)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", character.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	_, _, err = database.Client.From("characters").
		Delete("", "").
		Eq("id", id).
		Execute()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
