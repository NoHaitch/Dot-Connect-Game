package main

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

// Global variable for the database
var db *sql.DB

// Connects to the database.
// If there is no database then it creates a new one.
func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./game_data.db")
	if err != nil {
		PrintlnRed("[Main] DATABASE ERROR: " + err.Error())
	}

	// Create users table if it does not exist
	userTableCreationSQL := `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        highscore INTEGER DEFAULT 0
    );
    `
	_, err = db.Exec(userTableCreationSQL)
	if err != nil {
		PrintlnRed("[Main] DATABASE ERROR: " + err.Error())
	}

	// Create history table if it does not exist
	historyTableCreationSQL := `
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        mode TEXT NOT NULL,
        level INTEGER NOT NULL,
        score INTEGER NOT NULL,
        FOREIGN KEY(username) REFERENCES users(username)
    );
    `
	_, err = db.Exec(historyTableCreationSQL)
	if err != nil {
		PrintlnRed("[Main] DATABASE ERROR: " + err.Error())
	}
}

// Register function to add a new user
func register(username, password string) bool {
	var exists bool
	row := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`, username)
	err := row.Scan(&exists)
	if err != nil {
		PrintlnRed("[Main] Error Checking Username: " + err.Error())
		return false
	}

	if exists {
		return false
	}

	// Insert the new user
	_, err = db.Exec(`INSERT INTO users (username, password, highscore) VALUES (?, ?, ?)`, username, password, 0)
	if err != nil {
		PrintlnRed("[Main] Error Inserting Username: " + err.Error())
		return false
	}

	return true
}

// UpdateHighscore function to update the highscore for an existing user
func updateHighscore(username string, highscore int) bool {
	_, err := db.Exec(`UPDATE users SET highscore = ? WHERE username = ?`, highscore, username)
	if err != nil {
		PrintlnRed("[Main] Error Updating Highscore: " + err.Error())
		return false
	}
	return true
}

// AddGameHistory function to add a new game record to the history table
func addGameHistory(username, mode string, level, score int) bool {
	// Check if the username exists
	var exists bool
	row := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`, username)
	err := row.Scan(&exists)
	if err != nil {
		PrintlnRed("[Main] Error Checking Username: " + err.Error())
		return false
	}

	if !exists {
		PrintlnRed("[Main] Username not found: " + username)
		return false
	}

	// Insert the new game history
	_, err = db.Exec(`INSERT INTO history (username, mode, level, score) VALUES (?, ?, ?, ?)`, username, mode, level, score)
	if err != nil {
		PrintlnRed("[Main] Error Inserting Game History: " + err.Error())
		return false
	}

	// Update highscore if the new score is higher
	// Retrieve the current highscore
	var currentHighscore int
	row = db.QueryRow(`SELECT highscore FROM users WHERE username = ?`, username)
	err = row.Scan(&currentHighscore)
	if err != nil {
		PrintlnRed("[Main] Error Retrieving Highscore: " + err.Error())
		return false
	}

	if score > currentHighscore {
		return updateHighscore(username, score)
	}

	return true
}

// Get the top 5 users with the highest scores
func getLeaderboard() ([]map[string]interface{}, error) {
	rows, err := db.Query(`SELECT username, highscore FROM users ORDER BY highscore DESC LIMIT 5`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []map[string]interface{}
	for rows.Next() {
		var username string
		var highscore int
		if err := rows.Scan(&username, &highscore); err != nil {
			return nil, err
		}
		leaderboard = append(leaderboard, map[string]interface{}{
			"username":  username,
			"highscore": highscore,
		})
	}

	return leaderboard, nil
}

func init() {
	// Initialize database connection and ensure tables exist
	initDB()
}
