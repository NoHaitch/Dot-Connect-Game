package main

import (
	"database/sql"
	"strconv"

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
        manual_beginner INTEGER DEFAULT 0,
        manual_easy INTEGER DEFAULT 0,
        manual_medium INTEGER DEFAULT 0,
        manual_hard INTEGER DEFAULT 0,
        bot_beginner INTEGER DEFAULT 0,
        bot_easy INTEGER DEFAULT 0,
        bot_medium INTEGER DEFAULT 0,
        bot_hard INTEGER DEFAULT 0
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
        level TEXT NOT NULL,
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
	_, err = db.Exec(`INSERT INTO users (username, password) VALUES (?, ?)`, username, password)
	if err != nil {
		PrintlnRed("[Main] Error Inserting Username: " + err.Error())
		return false
	}

	return true
}

// UpdateHighscore function to update the highscore for a specific mode and level for an existing user
func updateHighscore(username, mode, level string, score int) bool {
	// Construct the column name dynamically
	columnName := mode + "_" + level

	// Update the highscore for the specified mode and level if the score is higher
	_, err := db.Exec(`UPDATE users SET `+columnName+` = ? WHERE username = ? AND `+columnName+` < ?`, score, username, score)
	if err != nil {
		PrintlnRed("[Main] Error Updating Highscore: " + err.Error())
		return false
	}
	return true
}

// AddGameHistory function to add a new game record to the history table
func addGameHistory(username, mode, level string, score int) bool {
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

	// Update highscore for the mode and level if the new score is higher
	return updateHighscore(username, mode, level, score)
}

// GetLeaderboard function to retrieve the top 5 users for a specific mode and level
func getLeaderboard(mode, level string) ([]map[string]interface{}, error) {
	// Construct the column name dynamically
	columnName := mode + "_" + level
	PrintlnGreen("[Database] Constructed Column Name: " + columnName)

	// Query to get the top 5 users for the specified mode and level, excluding scores of 0
	query := `
	SELECT username, ` + columnName + ` as highscore
	FROM users
	WHERE ` + columnName + ` > 0
	ORDER BY ` + columnName + ` DESC
	LIMIT 5;
	`

	PrintlnGreen("[Database] SQL Query: " + query)

	rows, err := db.Query(query)
	if err != nil {
		PrintlnRed("[Database] Error executing query: " + err.Error())
		return nil, err
	}
	defer rows.Close()

	var leaderboard []map[string]interface{}
	for rows.Next() {
		var username string
		var highscore int
		if err := rows.Scan(&username, &highscore); err != nil {
			PrintlnRed("[Database] Error scanning rows: " + err.Error())
			return nil, err
		}
		leaderboard = append(leaderboard, map[string]interface{}{
			"username":  username,
			"highscore": highscore,
		})
	}

	PrintlnGreen("[Database] Retrieved Leaderboard: ")
	for _, entry := range leaderboard {
		PrintlnGreen("Username: " + entry["username"].(string) + ", Highscore: " + strconv.Itoa(entry["highscore"].(int)))
	}

	return leaderboard, nil
}

func init() {
	// Initialize database connection and ensure tables exist
	initDB()
}
