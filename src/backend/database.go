package main

import (
	"database/sql"
	"fmt"

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
        bot_custom_beginner INTEGER DEFAULT 0,
        bot_custom_easy INTEGER DEFAULT 0,
        bot_custom_medium INTEGER DEFAULT 0,
        bot_custom_hard INTEGER DEFAULT 0,
        manual_random_beginner INTEGER DEFAULT 0,
        manual_random_easy INTEGER DEFAULT 0,
        manual_random_medium INTEGER DEFAULT 0,
        manual_random_hard INTEGER DEFAULT 0,
        manual_custom_beginner INTEGER DEFAULT 0,
        manual_custom_easy INTEGER DEFAULT 0,
        manual_custom_medium INTEGER DEFAULT 0,
        manual_custom_hard INTEGER DEFAULT 0
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
        boardType TEXT DEFAULT NULL,
        FOREIGN KEY(username) REFERENCES users(username)
    );
    `
	_, err = db.Exec(historyTableCreationSQL)
	if err != nil {
		PrintlnRed("[Main] DATABASE ERROR: " + err.Error())
	}
}

// Register function to add a new user
func register(username string, password string) bool {
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

// UpdateHighscore function to update the highscore for a specific mode, level, and board type for an existing user
func updateHighscore(username string, mode string, level string, boardType string, score int) bool {
	columnName := mode + "_" + boardType + "_" + level

	_, err := db.Exec(`UPDATE users SET `+columnName+` = ? WHERE username = ? AND (`+columnName+` = 0 OR `+columnName+` > ?)`, score, username, score)
	if err != nil {
		PrintlnRed("[Main] Error Updating Highscore: " + err.Error())
		return false
	}
	return true
}

// Add a new game record to the history table
func addGameHistory(username string, mode string, level string, boardType string, score int) bool {
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
	_, err = db.Exec(`INSERT INTO history (username, mode, level, score, boardType) VALUES (?, ?, ?, ?, ?)`, username, mode, level, score, boardType)
	if err != nil {
		PrintlnRed("[Main] Error Inserting Game History: " + err.Error())
		return false
	}

	return updateHighscore(username, mode, level, boardType, score)
}

// Retrieve the top 5 fastest users for a specific mode and level
func getLeaderboard(mode string, level string, boardType string) ([]map[string]interface{}, error) {
	columnName := mode + "_" + boardType + "_" + level
	fmt.Println(columnName)

	query := `
	SELECT username, ` + columnName + ` as bestTime
	FROM users
	WHERE ` + columnName + ` > 0
	ORDER BY ` + columnName + ` ASC
	LIMIT 5;
	`

	rows, err := db.Query(query)
	if err != nil {
		PrintlnRed("[Database] Error executing query: " + err.Error())
		return nil, err
	}
	defer rows.Close()

	var leaderboard []map[string]interface{}
	for rows.Next() {
		var username string
		var bestTime int
		if err := rows.Scan(&username, &bestTime); err != nil {
			PrintlnRed("[Database] Error scanning rows: " + err.Error())
			return nil, err
		}
		leaderboard = append(leaderboard, map[string]interface{}{
			"username":  username,
			"highscore": bestTime,
		})
	}

	return leaderboard, nil
}

// Login function to verify username and password
func login(username string, password string) bool {
	var storedPassword string
	row := db.QueryRow(`SELECT password FROM users WHERE username = ?`, username)
	err := row.Scan(&storedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			PrintlnRed("[Main] Username not found: " + username)
		} else {
			PrintlnRed("[Main] Error Checking Username: " + err.Error())
		}
		return false
	}

	if storedPassword == password {
		return true
	} else {
		PrintlnRed("[Main] Incorrect password for username: " + username)
		return false
	}
}

// Check if the score is better than the highscore
func isNewHighscore(username string, mode string, level string, score int, boardType string) (bool, error) {
	columnName := mode + "_" + boardType + "_" + level

	var currentHighscore int
	row := db.QueryRow(`SELECT `+columnName+` FROM users WHERE username = ?`, username)
	err := row.Scan(&currentHighscore)
	if err != nil {
		if err == sql.ErrNoRows {
			PrintlnRed("[Main] Username not found: " + username)
			return false, err
		} else {
			PrintlnRed("[Main] Error retrieving highscore: " + err.Error())
			return false, err
		}
	}

	if score > currentHighscore {
		return true, nil
	}

	return false, nil
}

func init() {
	// Initialize database connection and ensure tables exist
	initDB()
}
