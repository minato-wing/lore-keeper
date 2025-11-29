package models

import "time"

type Campaign struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Character struct {
	ID         string                 `json:"id"`
	CampaignID string                 `json:"campaign_id"`
	Name       string                 `json:"name"`
	Role       string                 `json:"role"`
	Attributes map[string]interface{} `json:"attributes"`
	Background string                 `json:"background,omitempty"`
	Embedding  []float32              `json:"-"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}

type Relationship struct {
	ID                string    `json:"id"`
	CampaignID        string    `json:"campaign_id"`
	SourceCharacterID string    `json:"source_character_id"`
	TargetCharacterID string    `json:"target_character_id"`
	RelationType      string    `json:"relation_type"`
	Description       string    `json:"description,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}

type LoreEntry struct {
	ID         string    `json:"id"`
	CampaignID string    `json:"campaign_id"`
	Title      string    `json:"title"`
	Category   string    `json:"category,omitempty"`
	Content    string    `json:"content"`
	Embedding  []float32 `json:"-"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateCampaignRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type CreateCharacterRequest struct {
	CampaignID string                 `json:"campaign_id" binding:"required"`
	Name       string                 `json:"name" binding:"required"`
	Role       string                 `json:"role"`
	Attributes map[string]interface{} `json:"attributes"`
	Background string                 `json:"background"`
}

type CreateRelationshipRequest struct {
	CampaignID        string `json:"campaign_id" binding:"required"`
	SourceCharacterID string `json:"source_character_id" binding:"required"`
	TargetCharacterID string `json:"target_character_id" binding:"required"`
	RelationType      string `json:"relation_type" binding:"required"`
	Description       string `json:"description"`
}

type CreateLoreEntryRequest struct {
	CampaignID string `json:"campaign_id" binding:"required"`
	Title      string `json:"title" binding:"required"`
	Category   string `json:"category"`
	Content    string `json:"content" binding:"required"`
}

type DeepDiveRequest struct {
	CampaignID string                 `json:"campaign_id" binding:"required"`
	Input      map[string]interface{} `json:"input" binding:"required"`
}

type DeepDiveResponse struct {
	Suggestions []string `json:"suggestions"`
}

type ConsistencyCheckRequest struct {
	CampaignID string `json:"campaign_id" binding:"required"`
	NewContent string `json:"new_content" binding:"required"`
}

type ConsistencyCheckResponse struct {
	IsConsistent bool     `json:"is_consistent"`
	Warnings     []string `json:"warnings,omitempty"`
}
