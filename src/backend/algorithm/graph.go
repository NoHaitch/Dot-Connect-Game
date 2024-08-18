package algorithm

import (
	"fmt"
)

// Graph data structure
type Graph struct {
	Nodes map[int]Node
	Edges map[int][]int
}

// Node for graph
type Node struct {
	ID int
	X  int
	Y  int
}

// Create a new Graph
func NewGraph() *Graph {
	return &Graph{
		Nodes: make(map[int]Node),
		Edges: make(map[int][]int),
	}
}

// Add a Node to the Graph
func (g *Graph) AddNode(id, x, y int) {
	g.Nodes[id] = Node{ID: id, X: x, Y: y}
}

// Add an Edge between two Nodes
func (g *Graph) AddEdge(from, to int) {
	g.Edges[from] = append(g.Edges[from], to)
}

// Convert a board to a Graph
func BoardToGraph(board [][]int) (*Graph, int, error) {
	rows := len(board)
	cols := len(board[0])
	graph := NewGraph()
	startID := -1
	nodeID := 0
	idMap := make([][]int, rows)
	for i := range idMap {
		idMap[i] = make([]int, cols)
	}

	// Add nodes
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if board[r][c] != 1 {
				if board[r][c] == 2 {
					startID = nodeID
				}
				idMap[r][c] = nodeID
				graph.AddNode(nodeID, r, c)
				nodeID++
			}
		}
	}

	// Add edges
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if board[r][c] != 1 {
				currentID := idMap[r][c]
				// Connect to the right
				if c < cols-1 && board[r][c+1] != 1 {
					graph.AddEdge(currentID, idMap[r][c+1])
				}
				// Connect to the left
				if c > 0 && board[r][c-1] != 1 {
					graph.AddEdge(currentID, idMap[r][c-1])
				}
				// Connect to the bottom
				if r < rows-1 && board[r+1][c] != 1 {
					graph.AddEdge(currentID, idMap[r+1][c])
				}
				// Connect to the top
				if r > 0 && board[r-1][c] != 1 {
					graph.AddEdge(currentID, idMap[r-1][c])
				}
			}
		}
	}

	// Check for isolated nodes
	for nodeID := range graph.Nodes {
		if len(graph.Edges[nodeID]) == 0 {
			return nil, -1, fmt.Errorf("isolated node detected with ID %d", nodeID)
		}
	}

	countEndPoint := 0
	for nodeID, edges := range graph.Edges {
		if nodeID != startID && len(edges) == 1 {
			countEndPoint++
		}
		if countEndPoint > 1 {
			break
		}
	}

	if countEndPoint > 1 {
		return nil, -1, fmt.Errorf("amount of endpoint > 1")
	}

	return graph, startID, nil
}

// Print Graph for Debugging
func (g *Graph) PrintGraph() {
	if g == nil {
		fmt.Println("Graph is nil")
		return
	}

	fmt.Println("Nodes:")
	for _, node := range g.Nodes {
		fmt.Printf("ID: %d, Position: (%d, %d)\n", node.ID, node.X, node.Y)
	}
	fmt.Println("Edges:")
	for from, edges := range g.Edges {
		fmt.Printf("Node %d -> %v\n", from, edges)
	}
}
