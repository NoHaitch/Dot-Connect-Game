package algorithm

// DFS algorithm for dot-connect returning positions
func DFS(graph *Graph, startID int) ([][2]int, bool) {
	visited := make([]bool, len(graph.Nodes))
	var path [][2]int

	// Start DFS
	result, found := DFSRecursive(graph, startID, visited, &path)
	return result, found
}

// Recursive DFS function to return positions
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
