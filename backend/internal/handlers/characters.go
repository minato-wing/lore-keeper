package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
)

type CharacterHandler struct{}

func NewCharacterHandler() *CharacterHandler {
	return &CharacterHandler{}
}

func (h *CharacterHandler) GetCharacters(c *gin.Context) {
	campaignID := c.Query("campaign_id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "campaign_id is required"})
		return
	}

	var characters []models.Character
	_, err := database.Client.DB.From("characters").
		Select("*", "", false).
		Eq("campaign_id", campaignID).
		Execute(&characters)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, characters)
}

func (h *CharacterHandler) GetCharacter(c *gin.Context) {
	id := c.Param("id")

	var character models.Character
	_, err := database.Client.DB.From("characters").
		Select("*", "", false).
		Eq("id", id).
		Single().
		Execute(&character)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	c.JSON(http.StatusOK, character)
}

func (h *CharacterHandler) CreateCharacter(c *gin.Context) {
	var req models.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
	_, err := database.Client.DB.From("characters").
		Insert(character, false, "", "", "").
		Execute(&result)

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
	id := c.Param("id")

	var req models.CreateCharacterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	update := map[string]interface{}{
		"name":       req.Name,
		"role":       req.Role,
		"attributes": req.Attributes,
		"background": req.Background,
	}

	var result []models.Character
	_, err := database.Client.DB.From("characters").
		Update(update, "", "").
		Eq("id", id).
		Execute(&result)

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
	id := c.Param("id")

	_, err := database.Client.DB.From("characters").
		Delete("", "").
		Eq("id", id).
		Execute(nil)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
