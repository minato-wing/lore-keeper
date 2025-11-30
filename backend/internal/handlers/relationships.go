package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
	"github.com/minato-wing/lore-keeper/backend/pkg/utils"
)

type RelationshipHandler struct{}

func NewRelationshipHandler() *RelationshipHandler {
	return &RelationshipHandler{}
}

func (h *RelationshipHandler) GetRelationships(c *gin.Context) {
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

	var relationships []models.Relationship
	_, err = database.Client.From("relationships").
		Select("*", "", false).
		Eq("campaign_id", campaignID).
		ExecuteTo(&relationships)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, relationships)
}

func (h *RelationshipHandler) CreateRelationship(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.CreateRelationshipRequest
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

	relationship := map[string]interface{}{
		"campaign_id":         req.CampaignID,
		"source_character_id": req.SourceCharacterID,
		"target_character_id": req.TargetCharacterID,
		"relation_type":       req.RelationType,
		"description":         req.Description,
	}

	var result []models.Relationship
	_, err = database.Client.From("relationships").
		Insert(relationship, false, "", "", "").
		ExecuteTo(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create relationship"})
		return
	}

	c.JSON(http.StatusCreated, result[0])
}

func (h *RelationshipHandler) UpdateRelationship(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	var req models.CreateRelationshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get relationship to verify ownership
	var relationship models.Relationship
	_, err := database.Client.From("relationships").
		Select("campaign_id", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&relationship)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "relationship not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", relationship.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	update := map[string]interface{}{
		"relation_type": req.RelationType,
		"description":   req.Description,
	}

	var result []models.Relationship
	_, err = database.Client.From("relationships").
		Update(update, "", "").
		Eq("id", id).
		ExecuteTo(&result)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(result) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "relationship not found"})
		return
	}

	c.JSON(http.StatusOK, result[0])
}

func (h *RelationshipHandler) DeleteRelationship(c *gin.Context) {
	userID, exists := utils.GetUserID(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	id := c.Param("id")

	// Get relationship to verify ownership
	var relationship models.Relationship
	_, err := database.Client.From("relationships").
		Select("campaign_id", "", false).
		Eq("id", id).
		Single().
		ExecuteTo(&relationship)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "relationship not found"})
		return
	}

	// Verify campaign belongs to user
	var campaign models.Campaign
	_, err = database.Client.From("campaigns").
		Select("id", "", false).
		Eq("id", relationship.CampaignID).
		Eq("user_id", userID).
		Single().
		ExecuteTo(&campaign)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
		return
	}

	_, _, err = database.Client.From("relationships").
		Delete("", "").
		Eq("id", id).
		Execute()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
