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

		if username == "" || password == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// main call
		success := register(username, password)
		if success {
			c.JSON(http.StatusOK, gin.H{"response": true})
		} else {
			c.JSON(http.StatusConflict, gin.H{"response": false})
		}
	})

	// Add Game History Endpoint
	r.GET("/addGameHistory", func(c *gin.Context) {
		username := c.Query("username")
		mode := c.Query("mode")
		level := c.Query("level")
		scoreStr := c.Query("score")

		if username == "" || mode == "" || level == "" || scoreStr == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Convert score to integer
		score, err := strconv.Atoi(scoreStr)
		if err != nil {
			PrintlnRed("[Main] Invalid Score Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "INVALID SCORE"})
			return
		}

		// Add game history
		success := addGameHistory(username, mode, level, score)
		if success {
			c.JSON(http.StatusOK, gin.H{"response": true})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"response": false})
		}
	})

	// Leaderboard Endpoint
	r.GET("/leaderboard", func(c *gin.Context) {
		mode := c.Query("mode")
		level := c.Query("level")

		// Validate mode and level
		if mode == "" || level == "" {
			PrintlnRed("[Main] Request Failed, Empty Mode or Level")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Get leaderboard
		leaderboard, err := getLeaderboard(mode, level)
		if err != nil {
			PrintlnRed("[Main] Error Getting Leaderboard: " + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"response": "ERROR"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
	})

	// Start server in a goroutine
	go func() {
		PrintlnGreen("[Main] Listening on port " + port)
		if err := r.Run("0.0.0.0:" + port); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	<-quit

	PrintlnRed("[Main] Shutting down server...")
}
