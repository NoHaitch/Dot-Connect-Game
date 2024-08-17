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
			bot_custom_beginner INTEGER DEFAULT NULL,
			bot_custom_easy INTEGER DEFAULT NULL,
			bot_custom_medium INTEGER DEFAULT NULL,
			bot_custom_hard INTEGER DEFAULT NULL,
			manual_random_beginner INTEGER DEFAULT NULL,
			manual_random_easy INTEGER DEFAULT NULL,
			manual_random_medium INTEGER DEFAULT NULL,
			manual_random_hard INTEGER DEFAULT NULL,
			manual_custom_beginner INTEGER DEFAULT NULL,
			manual_custom_easy INTEGER DEFAULT NULL,
			manual_custom_medium INTEGER DEFAULT NULL,
			manual_custom_hard INTEGER DEFAULT NULL
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
		date DATETIME DEFAULT CURRENT_TIMESTAMP,
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

// Update the highscore
func updateHighscore(username string, mode string, level string, boardType string, score int) bool {
	columnName := mode + "_" + boardType + "_" + level

	_, err := db.Exec(`UPDATE users SET `+columnName+` = ? WHERE username = ? AND (`+columnName+` IS NULL OR `+columnName+` > ?)`, score, username, score)
	if err != nil {
		PrintlnRed("[Main] Error Updating Highscore: " + err.Error())
		return false
	}
	return true
}

// Add a new game record
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

// Retrieve the leaderboard (top 5 fastest users)
func getLeaderboard(mode string, level string, boardType string) ([]map[string]interface{}, error) {
	columnName := mode + "_" + boardType + "_" + level

	query := `
	SELECT username, ` + columnName + ` as bestTime
	FROM users
	WHERE ` + columnName + ` IS NOT NULL
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
		var bestTime sql.NullInt64
		if err := rows.Scan(&username, &bestTime); err != nil {
			PrintlnRed("[Database] Error scanning rows: " + err.Error())
			return nil, err
		}
		if bestTime.Valid {
			leaderboard = append(leaderboard, map[string]interface{}{
				"username":  username,
				"highscore": bestTime.Int64,
			})
		}
	}

	fmt.Println(leaderboard)
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

	var currentHighscore *int
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

	if currentHighscore == nil {
		return true, nil
	}

	if score < *currentHighscore {
		return true, nil
	}

	return false, nil
}

// Retrieve the game history for a specific user
func getHistory(username string) ([]map[string]interface{}, error) {
	var exists bool
	row := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)`, username)
	err := row.Scan(&exists)
	if err != nil {
		PrintlnRed("[Main] Error Checking Username: " + err.Error())
		return nil, err
	}

	if !exists {
		PrintlnRed("[Main] Username not found: " + username)
		return nil, fmt.Errorf("username not found")
	}

	// Retrieve the game history for the user
	query := `
	SELECT mode, level, score, boardType, date
	FROM history
	WHERE username = ?
	ORDER BY date DESC;
	`

	rows, err := db.Query(query, username)
	if err != nil {
		PrintlnRed("[Database] Error executing query: " + err.Error())
		return nil, err
	}
	defer rows.Close()

	var history []map[string]interface{}
	for rows.Next() {
		var mode, level, boardType string
		var score int
		var date string
		if err := rows.Scan(&mode, &level, &score, &boardType, &date); err != nil {
			PrintlnRed("[Database] Error scanning rows: " + err.Error())
			return nil, err
		}
		history = append(history, map[string]interface{}{
			"mode":      mode,
			"level":     level,
			"score":     score,
			"boardType": boardType,
			"date":      date,
		})
	}

	return history, nil
}

func init() {
	initDB()
}
