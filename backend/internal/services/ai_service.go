package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type AIService struct {
	apiKey string
	client *http.Client
}

func NewAIService() *AIService {
	return &AIService{
		apiKey: os.Getenv("ANTHROPIC_API_KEY"),
		client: &http.Client{},
	}
}

type ClaudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	Messages  []ClaudeMessage `json:"messages"`
}

type ClaudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ClaudeResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
}

func (s *AIService) GenerateDeepDive(input map[string]interface{}) ([]string, error) {
	prompt := fmt.Sprintf(`You are a creative assistant for TRPG GMs and fiction writers. 
Given the following character information, generate 3-5 detailed suggestions to expand their background, personality, and story hooks.

Input: %v

Provide suggestions in JSON array format: ["suggestion1", "suggestion2", ...]`, input)

	response, err := s.callClaude(prompt)
	if err != nil {
		return nil, err
	}

	var suggestions []string
	if err := json.Unmarshal([]byte(response), &suggestions); err != nil {
		return []string{response}, nil
	}

	return suggestions, nil
}

func (s *AIService) CheckConsistency(newContent string, existingLore []string) (bool, []string, error) {
	existingText := ""
	for _, lore := range existingLore {
		existingText += lore + "\n\n"
	}

	prompt := fmt.Sprintf(`You are a consistency checker for world-building. 
Compare the new content against existing lore and identify any contradictions.

Existing Lore:
%s

New Content:
%s

Respond in JSON format: {"is_consistent": true/false, "warnings": ["warning1", "warning2"]}`, existingText, newContent)

	response, err := s.callClaude(prompt)
	if err != nil {
		return false, nil, err
	}

	var result struct {
		IsConsistent bool     `json:"is_consistent"`
		Warnings     []string `json:"warnings"`
	}

	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return false, []string{response}, nil
	}

	return result.IsConsistent, result.Warnings, nil
}

func (s *AIService) callClaude(prompt string) (string, error) {
	reqBody := ClaudeRequest{
		Model:     "claude-3-5-sonnet-20241022",
		MaxTokens: 2048,
		Messages: []ClaudeMessage{
			{
				Role:    "user",
				Content: prompt,
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := s.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error: %s", string(body))
	}

	var claudeResp ClaudeResponse
	if err := json.Unmarshal(body, &claudeResp); err != nil {
		return "", err
	}

	if len(claudeResp.Content) == 0 {
		return "", fmt.Errorf("empty response from Claude")
	}

	return claudeResp.Content[0].Text, nil
}
