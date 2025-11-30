package utils

import (
	"log"

	"github.com/gin-gonic/gin"
)

// GetUserID retrieves the user_id from the Gin context
// Returns the user_id string and a boolean indicating if it was found
func GetUserID(c *gin.Context) (string, bool) {
	value, exists := c.Get("user_id")
	if !exists {
		return "", false
	}
	
	userID, ok := value.(string)
	if !ok {
		return "", false
	}
	
	return userID, true
}
