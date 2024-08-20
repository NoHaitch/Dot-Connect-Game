package algorithm

import "fmt"

// DFS algorithm
func DFS(graph *Graph, startID int) ([][2]int, bool) {
	fmt.Println("[DFS] starting algorithm")

	visited := make([]bool, len(graph.Nodes))
	var path [][2]int

	result, found := DFSRecursive(graph, startID, visited, &path)

	return result, found
}

func DFSRecursive(graph *Graph, currentID int, visited []bool, path *[][2]int) ([][2]int, bool) {
	visited[currentID] = true
	*path = append(*path, [2]int{graph.Nodes[currentID].X, graph.Nodes[currentID].Y})

	// Check if all nodes are visited
	if len(*path) == len(graph.Nodes) {
		return *path, true
	}

	// Explore neighbors
	for _, neighbor := range graph.Edges[currentID] {
		if !visited[neighbor] {
			resultPath, found := DFSRecursive(graph, neighbor, visited, path)
			if found {
				return resultPath, true
			}
		}
	}

	// Backtrack
	visited[currentID] = false
	*path = (*path)[:len(*path)-1]

	return nil, false
}
