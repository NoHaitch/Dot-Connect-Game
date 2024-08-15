import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const Board = ({ board, onWin  }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startDot, setStartDot] = useState(null);
  const [lastDot, setLastDot] = useState(null);
  const [path, setPath] = useState([]);
  const [edges, setEdges] = useState([]);
  const [totalUsableDot, setTotalUsableDot] = useState(0);

  useEffect(() => {
    let initialStartDot = null;
    let totalDots = 0;

    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      for (let cellIndex = 0; cellIndex < board[rowIndex].length; cellIndex++) {
        if (board[rowIndex][cellIndex] === 2) {
          initialStartDot = { rowIndex, cellIndex };
          totalDots++;
        } else if (board[rowIndex][cellIndex] === 0) {
          totalDots++;
        }
      }
    }

    if (initialStartDot) {
      setStartDot(initialStartDot);
      setLastDot(initialStartDot);
      setPath([initialStartDot]);
    }

    setTotalUsableDot(totalDots);
  }, [board]);

  const handleStartDrawing = (rowIndex, cellIndex) => {
    setLastDot({ rowIndex, cellIndex });
    setIsDrawing(true);
  };

  const isAdjacent = (dot1, dot2) => {
    return (
      (dot1.rowIndex === dot2.rowIndex &&
        Math.abs(dot1.cellIndex - dot2.cellIndex) === 1) ||
      (dot1.cellIndex === dot2.cellIndex &&
        Math.abs(dot1.rowIndex - dot2.rowIndex) === 1)
    );
  };

  const isDotInPath = (rowIndex, cellIndex) => {
    return path.some(
      (dot) => dot.rowIndex === rowIndex && dot.cellIndex === cellIndex
    );
  };

  const handleDotClick = (rowIndex, cellIndex, event) => {
    if (event.button === 0) {
      if (board[rowIndex][cellIndex] === 1) {
        return;
      }

      const newDot = { rowIndex, cellIndex };
      if (
        lastDot === null ||
        (isAdjacent(lastDot, newDot) && !isDotInPath(rowIndex, cellIndex))
      ) {
        setPath((prevPath) => [...prevPath, newDot]);
        setLastDot(newDot);
      }
    }
  };

  const handleClearPath = (event) => {
    event.preventDefault();
    if (startDot) {
      setPath([startDot]);
      setLastDot(startDot);
    } else {
      setPath([]);
      setLastDot(null);
    }

    for (let index = 0; index < edges.length; index++) {
      const elementId = edges[index];
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "none";
      }
    }
    setEdges([]);
  };

  const handleEndDrawing = (rowIndex, cellIndex) => {
    const prevDot = path[path.length - 1];
    if (isDrawing) {
      if (
        prevDot.rowIndex === rowIndex &&
        isAdjacent(prevDot, { rowIndex, cellIndex }) &&
        !isDotInPath(rowIndex, cellIndex)
      ) {
        const elementId = `hr${rowIndex}-${
          prevDot.cellIndex > cellIndex ? cellIndex : cellIndex - 1
        }`;
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "block";
          setEdges((edges) => [...edges, elementId]);
        }
      }

      if (
        prevDot.cellIndex === cellIndex &&
        isAdjacent(prevDot, { rowIndex, cellIndex }) &&
        !isDotInPath(rowIndex, cellIndex)
      ) {
        const elementId = `br${
          prevDot.rowIndex > rowIndex ? rowIndex : rowIndex - 1
        }-${cellIndex}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "block";
          setEdges((edges) => [...edges, elementId]);
        }
      }
    }

    setIsDrawing(false);

    if (
      path.length === totalUsableDot - 1 &&
      !isDotInPath(rowIndex, cellIndex)
    ) {
      onWin()
    }
    if (path.length > 1) {
      setLastDot(path[path.length - 1]);
    } else {
      setLastDot(startDot);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg"
      onMouseUp={() => {
        if (isDrawing) {
          setIsDrawing(false);
        }
      }}
      onContextMenu={handleClearPath}
    >
      <div className="absolute flex pl-16 flex-col">
        {board.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row justify-center items-center"
          >
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="w-12 h-12 m-2 flex justify-center items-center"
              >
                <div
                  id={`hr${rowIndex}-${cellIndex}`}
                  className="bg-green-600 w-12 h-2 hidden"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="absolute flex pt-16 flex-col">
        {board.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-row justify-center items-center"
          >
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="w-12 h-12 m-2 flex justify-center items-center"
              >
                <div
                  id={`br${rowIndex}-${cellIndex}`}
                  className="bg-green-600 w-2 h-12 hidden"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {board.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="relative flex justify-center items-center"
        >
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={twMerge(
                "w-12 h-12 flex items-center justify-center text-lg font-bold m-2",
                `${
                  isDotInPath(rowIndex, cellIndex)
                    ? "bg-green-500"
                    : cell === 2
                    ? "bg-green-500 cursor-pointer"
                    : cell === 1
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gray-300"
                }`,
                `${cell === 1 ? "rounded-none" : "rounded-full"}`
              )}
              onMouseDown={(event) => {
                if (event.button === 0 && cell !== 1) {
                  handleStartDrawing(rowIndex, cellIndex);
                }
              }}
              onMouseUp={(event) => {
                if (event.button === 0 && cell !== 1) {
                  handleEndDrawing(rowIndex, cellIndex);
                }
              }}
              onClick={(event) => handleDotClick(rowIndex, cellIndex, event)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

Board.propTypes = {
  board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

export default Board;
