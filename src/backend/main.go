package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Starting API
	PrintlnYellow("[Main] Dot-Game API started...")
	port := "8080"

	// Quit handler
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	defer PrintlnRed("[Main] API Terminated...")

	// Gin instance
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// Test Endpoint
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API ready to use!")
	})

	// Register Endpoint
	r.GET("/register", func(c *gin.Context) {
		username := c.Query("username")
		password := c.Query("password")

		// Check for bad query
		if username == "" || password == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Call register function
		success := register(username, password)
		if success {
			c.JSON(http.StatusOK, gin.H{"response": true})
		} else {
			c.JSON(http.StatusConflict, gin.H{"response": false})
		}
	})

	// Add Game History Endpoint
	r.GET("/add_game_history", func(c *gin.Context) {
		username := c.Query("username")
		mode := c.Query("mode")
		level := c.Query("level")
		score := c.Query("score")

		// Convert level and score to integers
		levelInt, err := strconv.Atoi(level)
		if err != nil {
			PrintlnRed("[Main] Invalid level value")
			c.JSON(http.StatusBadRequest, gin.H{"response": "Invalid level"})
			return
		}

		scoreInt, err := strconv.Atoi(score)
		if err != nil {
			PrintlnRed("[Main] Invalid score value")
			c.JSON(http.StatusBadRequest, gin.H{"response": "Invalid score"})
			return
		}

		// Call addGameHistory function
		success := addGameHistory(username, mode, levelInt, scoreInt)
		if success {
			c.JSON(http.StatusOK, gin.H{"response": true})
		} else {
			c.JSON(http.StatusConflict, gin.H{"response": false})
		}
	})

	// Leaderboard Endpoint
	r.GET("/leaderboard", func(c *gin.Context) {
		// Fetch top 5 users by highscore
		leaderboard, err := getLeaderboard()
		if err != nil {
			PrintlnRed("[Main] Error Fetching Leaderboard: " + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"response": "Error fetching leaderboard"})
			return
		}

		c.JSON(http.StatusOK, leaderboard)
	})

	// Start server in a goroutine
	go func() {
		PrintlnGreen("[Main] Listening on port " + port)
		if err := r.Run("0.0.0.0:" + port); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Block until a signal is received
	<-quit

	// Perform cleanup
	PrintlnRed("[Main] Shutting down server...")
}
