package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
	"github.com/minato-wing/lore-keeper/backend/pkg/utils"
)

type LoreEntryHandler struct{}

func NewLoreEntryHandler() *LoreEntryHandler {
	return &LoreEntryHandler{}
}

func (h *LoreEntryHandler) GetLoreEntries(c *gin.Context) {
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

	var loreEntries []models.LoreEntry
	_, err = database.Client.From("lore_entries").
		Select("*", "", false).
		Eq("campaign_id", campaignID).
		ExecuteTo(&loreEntries)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, loreEntries)
}

func (h *LoreEntryHandler) GetLoreEntry(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	var loreEntry models.LoreEntry
	_, err := database.Client.From("lore_entries").
		Select("*", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&loreEntry)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "lore entry not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", loreEntry.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	c.JSON(http.StatusOK, loreEntry)
}

func (h *LoreEntryHandler) CreateLoreEntry(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.CreateLoreEntryRequest
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

	loreEntry := map[string]interface{}{
		"campaign_id": req.CampaignID,
		"title":       req.Title,
		"category":    req.Category,
		"content":     req.Content,
	}

	var result []models.LoreEntry
	_, err = database.Client.From("lore_entries").
		Insert(loreEntry, false, "", "", "").
		ExecuteTo(&result)

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
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	var req models.CreateLoreEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get lore entry to verify ownership
	var loreEntry models.LoreEntry
	_, err := database.Client.From("lore_entries").
		Select("campaign_id", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&loreEntry)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "lore entry not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", loreEntry.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	update := map[string]interface{}{
		"title":    req.Title,
		"category": req.Category,
		"content":  req.Content,
	}

	var result []models.LoreEntry
	_, err = database.Client.From("lore_entries").
		Update(update, "", "").
		Eq("id", id).
		ExecuteTo(&result)

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
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	// Get lore entry to verify ownership
	var loreEntry models.LoreEntry
	_, err := database.Client.From("lore_entries").
		Select("campaign_id", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&loreEntry)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "lore entry not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", loreEntry.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	_, _, err = database.Client.From("lore_entries").
		Delete("", "").
		Eq("id", id).
		Execute()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
