package algorithm

import (
	"fmt"
	"sort"
)

// Greedy algorithm to solve dot-connect game
func Greedy(board [][]int) ([][2]int, bool) {
	fmt.Println("[Greedy] starting algorithm")

	startPoint, usableDotCount, solvable := PreCheckBoard(board)
	if !solvable {
		return nil, false
	}

	visited := make(map[[2]int]bool)

	path, found := GreedyRecursive(board, startPoint[0], startPoint[1], visited, nil, usableDotCount)

	return path, found
}

func GreedyRecursive(board [][]int, r, c int, visited map[[2]int]bool, currPath [][2]int, usableDotCount int) ([][2]int, bool) {
	visited[[2]int{r, c}] = true
	currPath = append(currPath, [2]int{r, c})

	// Check if all usable dots are visited
	if len(currPath) == usableDotCount {
		return currPath, true
	}

	// Possible directions (up, down, left, right)
	directions := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

	type neighbor struct {
		position    [2]int
		connections int
	}
	neighbors := []neighbor{}

	for _, dir := range directions {
		newR := r + dir[0]
		newC := c + dir[1]

		if isValidMove(board, newR, newC, visited) {
			connections := countConnections(board, newR, newC, visited)
			neighbors = append(neighbors, neighbor{
				position:    [2]int{newR, newC},
				connections: connections,
			})
		}
	}

	// Sort neighbors by the number of active connections
	sort.Slice(neighbors, func(i, j int) bool {
		return neighbors[i].connections > neighbors[j].connections
	})

	// Try each neighbor in order of active connections
	for _, nbr := range neighbors {
		path, found := GreedyRecursive(board, nbr.position[0], nbr.position[1], visited, currPath, usableDotCount)
		if found {
			return path, true
		}
	}

	visited[[2]int{r, c}] = false

	return nil, false
}

// Count the active connection
func countConnections(board [][]int, r, c int, visited map[[2]int]bool) int {
	connections := 0
	directions := [][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}

	for _, dir := range directions {
		newR := r + dir[0]
		newC := c + dir[1]

		if isValidMove(board, newR, newC, visited) {
			connections++
		}
	}

	return connections
}
