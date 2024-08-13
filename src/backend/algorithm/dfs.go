package algorithm

// DFS algorithm for dot-connect
func DFS(graph *Graph, startID int) ([]int, bool) {
	visited := make([]bool, len(graph.Nodes))
	path := []int{}

	// Start DFS
	result, found := DFSRecursive(graph, startID, visited, &path)
	return result, found
}

// Recursive DFS function
func DFSRecursive(graph *Graph, currentID int, visited []bool, path *[]int) ([]int, bool) {
	visited[currentID] = true
	*path = append(*path, currentID)

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

	// backtrack
	visited[currentID] = false
	*path = (*path)[:len(*path)-1]

	return nil, false
}
