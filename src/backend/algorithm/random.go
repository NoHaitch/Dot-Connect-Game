package algorithm

import (
	"fmt"
	"math/rand"
	"time"
)

var boardSizes = map[string][2]int{
	"beginner": {5, 5},
	"easy":     {8, 6},
	"medium":   {10, 6},
	"hard":     {12, 8},
}

func GenerateRandomBoard(level string) ([][]int, error) {
	size, ok := boardSizes[level]
	if !ok {
		return nil, fmt.Errorf("invalid level: %s", level)
	}

	rows, cols := size[0], size[1]
	board := make([][]int, rows)
	for i := range board {
		board[i] = make([]int, cols)
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	for {
		placeStartingDot(board, rows, cols, rng)
		fillBoard(board, rows, cols, rng)
		return board, nil
		// If the random board must be solveable
		// if isSolvable(board) {
		// 	return board, nil
		// }
		// for i := range board {
		// 	for j := range board[i] {
		// 		board[i][j] = 0
		// 	}
		// }
	}
}

func placeStartingDot(board [][]int, rows, cols int, rng *rand.Rand) {
	r := rng.Intn(rows)
	c := rng.Intn(cols)
	board[r][c] = 2
}

func fillBoard(board [][]int, rows, cols int, rng *rand.Rand) {
	numCells := rows * cols
	numOnes := numCells * 15 / 100

	for i := 0; i < numOnes; i++ {
		r := rng.Intn(rows)
		c := rng.Intn(cols)
		for board[r][c] != 0 {
			r = rng.Intn(rows)
			c = rng.Intn(cols)
		}
		board[r][c] = 1
	}
}

func isSolvable(board [][]int) bool {
	graph, startID := BoardToGraph(board)
	_, found := DFS(graph, startID)
	return found
}
