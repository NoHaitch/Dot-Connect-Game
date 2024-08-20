package main

import (
	"dot-connect-api/algorithm"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	initDB()

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
	r.POST("/register", func(c *gin.Context) {
		var credentials struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := c.BindJSON(&credentials); err != nil {
			PrintlnRed("[Main] Invalid JSON Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
			return
		}

		username := credentials.Username
		password := credentials.Password

		if username == "" || password == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Register
		success := register(username, password)
		if success {
			c.JSON(http.StatusOK, gin.H{"response": true})
		} else {
			c.JSON(http.StatusConflict, gin.H{"response": false})
		}
	})

	// Add Game History Endpoint
	r.POST("/addGameHistory", func(c *gin.Context) {
		var gameHistory struct {
			Username  string `json:"username"`
			Mode      string `json:"mode"`
			Level     string `json:"level"`
			BoardType string `json:"boardType"`
			Score     int    `json:"score"`
		}

		if err := c.BindJSON(&gameHistory); err != nil {
			PrintlnRed("[Main] Invalid JSON Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
			return
		}

		username := gameHistory.Username
		mode := gameHistory.Mode
		level := gameHistory.Level
		boardType := gameHistory.BoardType
		score := gameHistory.Score

		if username == "" || mode == "" || level == "" || boardType == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		if mode == "bot" {
			boardType = "custom"
		}

		// Add game history
		success := addGameHistory(username, mode, level, boardType, score)
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
		boardType := c.Query("boardType") // New parameter for board type

		// Validate mode, level, and boardType
		if mode == "" || level == "" || boardType == "" {
			PrintlnRed("[Main] Request Failed, Empty Mode, Level, or Board Type")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Get leaderboard
		leaderboard, err := getLeaderboard(mode, level, boardType)
		if err != nil {
			PrintlnRed("[Main] Error Getting Leaderboard: " + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"response": "ERROR"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
	})

	// Login Endpoint
	r.POST("/login", func(c *gin.Context) {
		var credentials struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := c.BindJSON(&credentials); err != nil {
			PrintlnRed("[Main] Invalid JSON Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
			return
		}

		username := credentials.Username
		password := credentials.Password

		if username == "" || password == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Login
		success := login(username, password)
		if success {
			c.JSON(http.StatusOK, gin.H{"response": true})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"response": false})
		}
	})

	// Generate Random Board Endpoint
	r.GET("/generateRandom", func(c *gin.Context) {
		level := c.Query("level")

		// Check if level is provided
		if level == "" {
			PrintlnRed("[Main] Request Failed, Empty Level")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		// Generate the board
		board, err := algorithm.GenerateRandomBoard(level)
		if err != nil {
			PrintlnRed("[Main] Error Generating Random Board: " + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"response": "ERROR", "message": err.Error()})
			return
		}

		// Return the board as JSON
		c.JSON(http.StatusOK, gin.H{"board": board})
	})

	// Check if score is better than highscore
	r.GET("/isHighscore", func(c *gin.Context) {
		username := c.Query("username")
		mode := c.Query("mode")
		level := c.Query("level")
		boardType := c.Query("boardType")
		scoreStr := c.Query("score")

		if username == "" || mode == "" || level == "" || scoreStr == "" || boardType == "" {
			PrintlnRed("[Main] Request Failed, Empty Query")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		if mode == "bot" {
			boardType = "custom"
		}

		// Convert score to integer
		score, err := strconv.Atoi(scoreStr)
		if err != nil {
			PrintlnRed("[Main] Invalid Score Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "INVALID SCORE"})
			return
		}

		// Check if the score is higher than the highscore
		isHigher, err := isNewHighscore(username, mode, level, score, boardType)
		if err != nil {
			PrintlnRed("[Main] Error Checking Highscore: " + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"response": "ERROR"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"response": isHigher})
	})

	// Get User History Endpoint
	r.GET("/userHistory", func(c *gin.Context) {
		username := c.Query("username")
		if username == "" {
			PrintlnRed("[Main] Request Failed, Empty Username")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD QUERY"})
			return
		}

		history, err := getHistory(username)
		if err != nil {
			PrintlnRed("[Main] Error Getting User History: " + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"response": "ERROR"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"history": history})
	})

	// Solve DFS Endpoint
	r.POST("/solvedfs", func(c *gin.Context) {
		var requestData struct {
			Board [][]int `json:"board"`
		}

		if err := c.BindJSON(&requestData); err != nil {
			PrintlnRed("[Main] Invalid JSON Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
			return
		}

		board := requestData.Board

		// Start timer
		startTime := time.Now()

		graph, startID, err := algorithm.BoardToGraph(board)
		if err != nil {
			duration := time.Since(startTime)

			response := gin.H{
				"found": false,
				"time":  duration.Milliseconds(),
			}

			c.JSON(http.StatusOK, response)
		} else {
			path, found := algorithm.DFS(graph, startID)

			duration := time.Since(startTime)

			response := gin.H{
				"found": found,
				"time":  duration.Milliseconds(),
			}

			if found {
				response["path"] = path
			} else {
				response["message"] = "No solution found"
			}

			c.JSON(http.StatusOK, response)
		}
	})

	// Solve Brute Force Endpoint
	r.POST("/solvebf", func(c *gin.Context) {
		var requestData struct {
			Board [][]int `json:"board"`
		}

		if err := c.BindJSON(&requestData); err != nil {
			PrintlnRed("[Main] Invalid JSON Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
			return
		}

		board := requestData.Board

		// Start timer
		startTime := time.Now()

		graph, startID, _ := algorithm.BoardToGraph(board)
		path, found := algorithm.DFS(graph, startID)

		duration := time.Since(startTime)

		response := gin.H{
			"found": found,
			"time":  duration.Milliseconds(),
		}

		if found {
			response["path"] = path
		} else {
			response["message"] = "No solution found"
		}

		c.JSON(http.StatusOK, response)

	})

	// Solve Greedy Algorithm Endpoint
	r.POST("/solvegreed", func(c *gin.Context) {
		var requestData struct {
			Board [][]int `json:"board"`
		}

		if err := c.BindJSON(&requestData); err != nil {
			PrintlnRed("[Main] Invalid JSON Format")
			c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
			return
		}

		board := requestData.Board

		// Start timer
		startTime := time.Now()

		path, found := algorithm.Greedy(board)

		duration := time.Since(startTime)

		response := gin.H{
			"found": found,
			"time":  duration.Milliseconds(),
		}

		if found {
			response["path"] = path
		} else {
			response["message"] = "No solution found"
		}

		c.JSON(http.StatusOK, response)

	})

	// Solve Main Algorithm Endpoint
	// NOT FINISHED -- look at algorithm/mainAlgo.go
	// r.POST("/solvemain", func(c *gin.Context) {
	// 	var requestData struct {
	// 		Board [][]int `json:"board"`
	// 	}

	// 	if err := c.BindJSON(&requestData); err != nil {
	// 		PrintlnRed("[Main] Invalid JSON Format")
	// 		c.JSON(http.StatusBadRequest, gin.H{"response": "BAD REQUEST"})
	// 		return
	// 	}

	// 	board := requestData.Board

	// 	// Start timer
	// 	startTime := time.Now()

	// 	path, found := algorithm.MainAlgo(board)

	// 	duration := time.Since(startTime)

	// 	response := gin.H{
	// 		"found": found,
	// 		"time":  duration.Milliseconds(),
	// 	}

	// 	if found {
	// 		response["path"] = path
	// 	} else {
	// 		response["message"] = "No solution found"
	// 	}

	// 	c.JSON(http.StatusOK, response)

	// })

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
