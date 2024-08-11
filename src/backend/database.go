package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

// Global variable for the database
var db *sql.DB

// Connects to the database.
// If there is no database then it creates a new one.
func initDB() {
	var err error
	// Open (or create) the database file
	db, err = sql.Open("sqlite3", "./game_data.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create users table if it does not exist
	tableCreationSQL := `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        highscore INTEGER DEFAULT 0
    );
    `

	_, err = db.Exec(tableCreationSQL)
	if err != nil {
		log.Fatal(err)
	}
}

// Register a new user.
// Return True if registration succeeded false otherwise.
func register(username, password string) bool {
	var exists bool
	row := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`, username)
	err := row.Scan(&exists)
	if err != nil {
		log.Println("Error checking username:", err)
		return false
	}

	if exists {
		return false
	}

	// Insert the new user
	_, err = db.Exec(`INSERT INTO users (username, password, highscore) VALUES (?, ?, ?)`, username, password, 0)
	if err != nil {
		log.Println("Error inserting new user:", err)
		return false
	}

	return true
}

// Update the highscore for an existing user.
// Return True if update succeeded false otherwise.
func updateHighscore(username string, highscore int) bool {
	_, err := db.Exec(`UPDATE users SET highscore = ? WHERE username = ?`, highscore, username)
	if err != nil {
		log.Println("Error updating highscore:", err)
		return false
	}
	return true
}

func init() {
	// Initialize database connection and ensure table exists
	initDB()
}
