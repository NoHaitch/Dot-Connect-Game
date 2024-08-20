package algorithm

import "fmt"

// Brute Force algorithm to solve dot-connect
func BruteForce(board [][]int) ([][2]int, bool) {
	fmt.Println("[BruteForce] starting algorithm")

	startPoint, usableDotCount, solvable := PreCheckBoard(board)
	if !solvable {
		return nil, false
	}

	visited := make(map[[2]int]bool)

	path, found := BruteForceRecursive(board, startPoint[0], startPoint[1], visited, nil, usableDotCount)

	return path, found
}

func BruteForceRecursive(board [][]int, r, c int, visited map[[2]int]bool, currPath [][2]int, usableDotCount int) ([][2]int, bool) {
	visited[[2]int{r, c}] = true
	currPath = append(currPath, [2]int{r, c})

	if len(currPath) == usableDotCount {
		return currPath, true
	}

	// Possible directions (up, down, left, right)
	directions := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

	// Explore neighbors
	for _, dir := range directions {
		newR := r + dir[0]
		newC := c + dir[1]

		if isValidMove(board, newR, newC, visited) {
			path, found := BruteForceRecursive(board, newR, newC, visited, currPath, usableDotCount)
			if found {
				return path, true
			}
		}
	}

	visited[[2]int{r, c}] = false

	return nil, false
}

// Check if a move is valid
func isValidMove(board [][]int, r, c int, visited map[[2]int]bool) bool {
	return r >= 0 && r < len(board) && c >= 0 && c < len(board[0]) && board[r][c] != 1 && !visited[[2]int{r, c}]
}
