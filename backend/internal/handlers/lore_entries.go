package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
)

type LoreEntryHandler struct{}

func NewLoreEntryHandler() *LoreEntryHandler {
	return &LoreEntryHandler{}
}

func (h *LoreEntryHandler) GetLoreEntries(c *gin.Context) {
	campaignID := c.Query("campaign_id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "campaign_id is required"})
		return
	}

	var loreEntries []models.LoreEntry
	_, err := database.Client.DB.From("lore_entries").
		Select("*", "", false).
		Eq("campaign_id", campaignID).
		Execute(&loreEntries)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, loreEntries)
}

func (h *LoreEntryHandler) GetLoreEntry(c *gin.Context) {
	id := c.Param("id")

	var loreEntry models.LoreEntry
	_, err := database.Client.DB.From("lore_entries").
		Select("*", "", false).
		Eq("id", id).
		Single().
		Execute(&loreEntry)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "lore entry not found"})
		return
	}

	c.JSON(http.StatusOK, loreEntry)
}

func (h *LoreEntryHandler) CreateLoreEntry(c *gin.Context) {
	var req models.CreateLoreEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	loreEntry := map[string]interface{}{
		"campaign_id": req.CampaignID,
		"title":       req.Title,
		"category":    req.Category,
		"content":     req.Content,
	}

	var result []models.LoreEntry
	_, err := database.Client.DB.From("lore_entries").
		Insert(loreEntry, false, "", "", "").
		Execute(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create lore entry"})
		return
	}

	c.JSON(http.StatusCreated, result[0])
}

func (h *LoreEntryHandler) UpdateLoreEntry(c *gin.Context) {
	id := c.Param("id")

	var req models.CreateLoreEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	update := map[string]interface{}{
		"title":    req.Title,
		"category": req.Category,
		"content":  req.Content,
	}

	var result []models.LoreEntry
	_, err := database.Client.DB.From("lore_entries").
		Update(update, "", "").
		Eq("id", id).
		Execute(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "lore entry not found"})
		return
	}

	c.JSON(http.StatusOK, result[0])
}

func (h *LoreEntryHandler) DeleteLoreEntry(c *gin.Context) {
	id := c.Param("id")

	_, err := database.Client.DB.From("lore_entries").
		Delete("", "").
		Eq("id", id).
		Execute(nil)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
