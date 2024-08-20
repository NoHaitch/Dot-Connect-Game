package algorithm

// PreCheckBoard checks if the board is solvable or not.
func PreCheckBoard(board [][]int) ([2]int, int, bool) {
	rows := len(board)
	cols := len(board[0])

	var startPoint [2]int
	usableDotCount := 0
	countEndPoint := 0

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if board[r][c] == 2 {
				startPoint = [2]int{r, c}
				usableDotCount++
			}
			if board[r][c] == 0 {
				usableDotCount++
				connection := 0
				if r+1 < rows && (board[r+1][c] == 0 || board[r+1][c] == 2) {
					connection++
				}
				if r-1 >= 0 && (board[r-1][c] == 0 || board[r-1][c] == 2) {
					connection++
				}
				if c+1 < cols && (board[r][c+1] == 0 || board[r][c+1] == 2) {
					connection++
				}
				if c-1 >= 0 && (board[r][c-1] == 0 || board[r][c-1] == 2) {
					connection++
				}
				if connection == 0 {
					return [2]int{0, 0}, 0, false
				} else if connection == 1 {
					countEndPoint++
					if countEndPoint > 1 {
						return [2]int{0, 0}, 0, false
					}
				}
			}
		}
	}

	return startPoint, usableDotCount, true
}

// MainAlgo algorithm
// Not Finished
// Ideas:
// - bruteforce/dfs added concurentcy
// - Group the dots into blocks (n x m)
// - Have a template of how to solve (n x m)
// - Avoid making more endpoints (dots with 1 connection)
