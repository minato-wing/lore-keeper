package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/minato-wing/lore-keeper/backend/internal/database"
	"github.com/minato-wing/lore-keeper/backend/internal/models"
)

type RelationshipHandler struct{}

func NewRelationshipHandler() *RelationshipHandler {
	return &RelationshipHandler{}
}

func (h *RelationshipHandler) GetRelationships(c *gin.Context) {
	campaignID := c.Query("campaign_id")
	if campaignID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "campaign_id is required"})
		return
	}

	var relationships []models.Relationship
	_, err := database.Client.DB.From("relationships").
		Select("*", "", false).
		Eq("campaign_id", campaignID).
		Execute(&relationships)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, relationships)
}

func (h *RelationshipHandler) CreateRelationship(c *gin.Context) {
	var req models.CreateRelationshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
	_, err := database.Client.DB.From("relationships").
		Insert(relationship, false, "", "", "").
		Execute(&result)

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
	id := c.Param("id")

	var req models.CreateRelationshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	update := map[string]interface{}{
		"relation_type": req.RelationType,
		"description":   req.Description,
	}

	var result []models.Relationship
	_, err := database.Client.DB.From("relationships").
		Update(update, "", "").
		Eq("id", id).
		Execute(&result)

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
	id := c.Param("id")

	_, err := database.Client.DB.From("relationships").
		Delete("", "").
		Eq("id", id).
		Execute(nil)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
