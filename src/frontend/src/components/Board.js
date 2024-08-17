import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const Board = ({ board, onWin, isInteractive, isBotMode }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startDot, setStartDot] = useState(null);
  const [lastDot, setLastDot] = useState(null);
  const [path, setPath] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [animationPath, setAnimationPath] = useState([]);
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
    if (!isInteractive) return;
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
    if (!isInteractive && !isBotMode) {
      return;
    }

    if (isBotMode) {
      const newDot = { rowIndex, cellIndex };
      if (lastDot.rowIndex === newDot.rowIndex) {
        const elementId = `hr${rowIndex}-${
          lastDot.cellIndex > cellIndex ? cellIndex : cellIndex - 1
        }`;
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "block";
          setEdges((edges) => [...edges, elementId]);
        }
      }

      if (lastDot.cellIndex === newDot.cellIndex) {
        const elementId = `br${
          lastDot.rowIndex > rowIndex ? rowIndex : rowIndex - 1
        }-${cellIndex}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "block";
          setEdges((edges) => [...edges, elementId]);
        }
      }

      setPath((prevPath) => [...prevPath, newDot]);
      setLastDot(newDot);
    } else if (event.button === 0) {
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
    if (event) {
      event.preventDefault();
      if (!isInteractive) return;
      if (startDot) {
        setPath([startDot]);
        setLastDot(startDot);
      } else {
        setPath([]);
        setLastDot(null);
      }
    } else {
      if (startDot) {
        setPath([startDot]);
        setLastDot(startDot);
      } else {
        setPath([]);
        setLastDot(null);
      }
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
    if (!isInteractive) return;
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
      const newDot = { rowIndex, cellIndex };
      setPath((path) => [...path, newDot]);
      onWin();
      setAnimationPath([...path, newDot]);
    }
    if (path.length > 1) {
      setLastDot(path[path.length - 1]);
    } else {
      setLastDot(startDot);
    }
  };

  const handleAnimatePath = async () => {
    if (animating) {
      return;
    }

    if (animationPath.length === 0) {
      setAnimationPath(path);
      await new Promise((resolve) => setTimeout(resolve, 100));

      document
        .getElementById("animate-button")
        .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }

    setAnimating(true);

    handleClearPath();

    for (let i = 1; i < animationPath.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const prevDot = animationPath[i - 1];
      const currDot = animationPath[i];
      setPath((path) => [...path, animationPath[i]]);
      if (prevDot.rowIndex === currDot.rowIndex) {
        const elementId = `hr${currDot.rowIndex}-${
          prevDot.cellIndex > currDot.cellIndex
            ? currDot.cellIndex
            : currDot.cellIndex - 1
        }`;
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "block";
          setEdges((edges) => [...edges, elementId]);
        }
      }

      if (prevDot.cellIndex === currDot.cellIndex) {
        const elementId = `br${
          prevDot.rowIndex > currDot.rowIndex
            ? currDot.rowIndex
            : currDot.rowIndex - 1
        }-${currDot.cellIndex}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "block";
          setEdges((edges) => [...edges, elementId]);
        }
      }
    }

    setAnimating(false);
  };

  return (
    <>
      <div
        className={twMerge(
          "relative flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg",
          !isInteractive && "pointer-events-none"
        )}
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
                id={`dot${rowIndex}-${cellIndex}`}
                className={twMerge(
                  "w-12 h-12 flex items-center justify-center text-lg font-bold m-2 transition-colors duration-300",
                  `${
                    isDotInPath(rowIndex, cellIndex)
                      ? "bg-green-500"
                      : cell === 2
                      ? "bg-green-500"
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
      {!isInteractive && (
        <div className="absolute mr-[-800px]">
          <button
            className="px-3 py-4 bg-yellow-300 rounded-lg hover:bg-yellow-500"
            onClick={() => handleAnimatePath()}
            id="animate-button"
          >
            Animate Solution
          </button>
        </div>
      )}
    </>
  );
};

Board.propTypes = {
  board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  onWin: PropTypes.func.isRequired,
  isInteractive: PropTypes.bool.isRequired,
  isBotMode: PropTypes.bool.isRequired,
};

export default Board;
