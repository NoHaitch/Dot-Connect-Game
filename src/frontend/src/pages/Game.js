import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import { TbConfetti } from "react-icons/tb";
import PageTitle from "../components/PageTitle";
import JSONFilePicker from "../components/JSONFilePicker";
import Board from "../components/Board";
import Timer from "../components/Timer";

function Game() {
  const location = useLocation();
  const navigate = useNavigate();

  const username = location.state?.username || localStorage.getItem("username");
  const mode = location.state?.mode;
  const level = location.state?.level;
  const boardType = location.state?.boardType;

  const [showGame, setShowGame] = useState(false);
  const [showStartGame, setShowStartGame] = useState(false);
  const [showJSONInput, setShowJSONInput] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [jsonFileData, setJsonFileData] = useState(null);
  const [algorithm, setAlgorithm] = useState("dfs");

  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [newHighscore, setNewHighscore] = useState(false);
  const [score, setScore] = useState(false);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [isFetchingBoard, setIsFetchingBoard] = useState(false);
  const [isBoardActive, setIsBoardActive] = useState(false);
  const [isBotSolving, setIsBotSolving] = useState(false);

  useEffect(() => {
    if (!username || !mode || !level) {
      navigate("/settings");
      return;
    }

    if (mode === "manual") {
      setIsBoardActive(true);
    }

    if (boardType === "random" && mode === "manual") {
      setIsFetchingBoard(true);
      fetchRandomBoard();
    } else if (mode === "bot") {
      setShowJSONInput(true);
    } else if (mode === "manual" && boardType === "custom") {
      setShowJSONInput(true);
    } else {
      setShowStartGame(true);
    }

    localStorage.setItem("username", username);
  }, [username, mode, level, boardType, navigate]);

  const fetchRandomBoard = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/generateRandom?level=${level}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setJsonFileData({ board: data.board });
      setIsFetchingBoard(false);
      setShowStartGame(true);
    } catch (error) {
      console.error("Error fetching random board:", error);
      setIsFetchingBoard(false);
    }
  };

  const handleFileSelect = (data) => {
    setJsonFileData(data);
    setShowJSONInput(false);

    if (mode === "bot") {
      setShowAlgorithm(true);
    }

    setShowStartGame(true);
  };

  const handleStartGame = async () => {
    setShowBackground(false);
    setShowGame(true);
    setIsTimerActive(true);
    if (mode === "bot") {
      handleSolveBot();
    }
  };

  const handleSolveBot = async () => {
    if (!jsonFileData || !jsonFileData.board) {
      console.error("Board data is not available.");
      return;
    }

    setIsBotSolving(true);

    try {
      const endpoint = `http://localhost:8080/solve${algorithm}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ board: jsonFileData.board }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Time:", data.time);
      console.log("Path", data.path);
      const solution = data.path;
      for (let i = 1; i < solution.length; i++) {
        const elementId = `dot${solution[i][0]}-${solution[i][1]}`;
        const element = document.getElementById(elementId);
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (element) {
          element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      }
    } catch (error) {
      console.error("Error during bot solution:", error);
    } finally {
      setIsBotSolving(false);
    }
  };

  const handleWin = async () => {
    setIsTimerActive(false);
    setShowWinPopup(false);

    try {
      setShowLoading(true);

      const response = await fetch(
        `http://localhost:8080/isHighscore?username=${username}&score=${score}&mode=${mode}&level=${level}&boardType=${boardType}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.response) {
        setNewHighscore(true);
      } else {
        setNewHighscore(false);
      }

      await addGameHistory();
    } catch (error) {
      console.error("Error during handleWin:", error);
      setNewHighscore(false);
    } finally {
      setShowLoading(false);
      setShowWinPopup(true);
      setIsBoardActive(false);
    }
  };

  const addGameHistory = async () => {
    try {
      const response = await fetch("http://localhost:8080/addGameHistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          score,
          mode,
          level,
          boardType,
          newHighscore,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add game history");
      }
    } catch (error) {
      console.error("Error during addGameHistory:", error);
    }
  };

  const handleBackToSettings = () => {
    if (isTimerActive) {
      setShowQuitConfirmation(true);
    } else {
      navigate("/settings");
    }
  };

  const confirmQuit = () => {
    setIsTimerActive(false);
    navigate("/settings");
  };

  const cancelQuit = () => {
    setShowQuitConfirmation(false);
  };

  const handleTimeUpdate = (time) => {
    setScore(time);
  };

  if (!username || !mode || !level) {
    return null;
  }

  return (
    <>
      <PageTitle title="Dot-Connect Game" />
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#5bffa0] to-[#1b0900]">
        {isFetchingBoard && (
          <div className="absolute w-screen h-screen bg-black bg-opacity-85 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg flex justify-center items-center flex-col">
              <h1 className="text-gray-900 text-lg mb-4">
                Generating board...
              </h1>
            </div>
          </div>
        )}

        {showGame && (
          <>
            <div className="absolute ml-[-800px] flex flex-col justify-center">
              <Timer isActive={isTimerActive} onTimeUpdate={handleTimeUpdate} />
              {mode === "bot" && (
                <h1 className="text-xs w-[160px] text-center mt-2">
                  Note: Live timer is not accurate to the speed of bot. After
                  bot finished solving, the timer is changed to the accurate
                  meassurement
                </h1>
              )}
            </div>
            {mode === "manual" ? (
              <div className="flex flex-col justify-center items-center">
                {isBoardActive ? (
                  <div className="m-2 font-bold text-gray-700 text-center">
                    <p>Left Click a dot to make a connection</p>
                    <p>Right Click to reset the board</p>
                  </div>
                ) : (
                  <div className="m-2 font-bold text-gray-700 text-center">
                    <p>Finished Board</p>
                  </div>
                )}
                <Board
                  board={jsonFileData.board}
                  onWin={handleWin}
                  isInteractive={isBoardActive}
                  isBotMode={isBotSolving}
                />
                {boardType === "random" && isBoardActive && (
                  <div className="absolute bottom-5">
                    <button
                      className="px-4 py-3 rounded-lg bg-yellow-100 text-gray-700 text-xm"
                      onClick={() => {
                        setShowGame(false);
                        setShowBackground(true);
                        setIsFetchingBoard(true);
                        fetchRandomBoard();
                      }}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center">
                {isBotSolving ? (
                  <div className="m-2 font-bold text-gray-700 text-center flex items-center justify-center">
                    <svg
                      aria-hidden="true"
                      class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <h1>Solving the problem ... </h1>
                  </div>
                ) : (
                  <div className="m-2 font-bold text-gray-700 text-center">
                    <p>Bot Finished Solving</p>
                  </div>
                )}
                <Board
                  board={jsonFileData.board}
                  onWin={handleWin}
                  isInteractive={isBoardActive}
                  isBotMode={isBotSolving}
                />
              </div>
            )}
            <div className="absolute bottom-5 left-5">
              <button
                onClick={handleBackToSettings}
                className="flex flex-row justify-center items-center w-[250px] hover:text-slate-700"
              >
                <RiArrowGoBackFill className="m-2" /> Back to Settings
              </button>
            </div>
            <div className="absolute top-5 left-5 p-2 rounded-lg bg-white bg-opacity-50">
              <h1 className="text-xl font-bold">Settings</h1>
              <h2>Mode: {mode}</h2>
              <h2>Level: {level}</h2>
              <h2>Board Type: {boardType}</h2>
              {mode === "bot" && <h2>Algorithm: {algorithm}</h2>}
            </div>
          </>
        )}

        {showBackground && !isFetchingBoard && (
          <div className="absolute w-screen h-screen bg-black bg-opacity-85 flex justify-center items-center">
            {showJSONInput && (
              <JSONFilePicker onFileSelect={handleFileSelect} level={level} />
            )}
            {showStartGame && (
              <div className="p-8 rounded-lg flex justify-center items-center flex-col">
                {showAlgorithm && (
                  <div className="flex flex-col justify-center items-center m-4 mb-8">
                    <h1 className="text-lg text-white font-bold m-2">
                      Choose an algorithm
                    </h1>
                    <div className="flex space-x-3">
                      <button
                        className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out bg-green-400 ${
                          algorithm === "dfs"
                            ? "text-gray-900 scale-110"
                            : "text-gray-800 opacity-50"
                        }`}
                        onClick={() => setAlgorithm("dfs")}
                      >
                        DFS
                      </button>
                      <button
                        className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out bg-lime-400 ${
                          algorithm === "other"
                            ? "text-gray-900 scale-110"
                            : "text-gray-800 opacity-50"
                        }`}
                        onClick={() => setAlgorithm("other")}
                      >
                        Other
                      </button>
                    </div>
                  </div>
                )}
                <h1 className="text-gray-400 text-lg mb-4">
                  Note: The timer starts the moment the button is pressed
                </h1>
                <div className="flex flex-row justify-center items-center space-x-4 text-gray-400 mb-4">
                  <h2>Mode: {mode}</h2>
                  <h2>Level: {level}</h2>
                  <h2>Board: {boardType}</h2>
                </div>
                <button
                  className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-700 transition-transform duration-300 ease-in-out mb-4"
                  onClick={handleStartGame}
                >
                  Start Game
                </button>
                <Link
                  to="/settings"
                  className="text-slate-600 flex flex-row justify-center items-center w-[250px] hover:text-slate-400"
                >
                  <RiArrowGoBackFill className="m-2" /> Go Back
                </Link>
              </div>
            )}
          </div>
        )}

        {showWinPopup && (
          <div className="absolute w-screen h-screen bg-black bg-opacity-85 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg flex justify-center items-center flex-col  w-[300px]">
              <h1 className="text-black  text-2xl m-3">You Win!</h1>
              <h1 className="text-gray-900 text-lg m-1">Score</h1>
              <h1 className="mb-4">{score} ms</h1>
              {showLoading && (
                <div className="absolute w-screen h-screen bg-black bg-opacity-85 flex justify-center items-center">
                  <div className="bg-white p-8 rounded-lg flex justify-center items-center flex-col">
                    <h1 className="text-gray-900 text-lg mb-4">
                      Checking highscore...
                    </h1>
                  </div>
                </div>
              )}
              {newHighscore && (
                <div className="flex flex-row m-1 justify-center text-center">
                  <TbConfetti className="size-[16px]" />
                  <h1 className="red">New Highscore !</h1>
                </div>
              )}
              <button
                className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-700 transition-transform duration-300 ease-in-out mb-4"
                onClick={() => navigate("/settings")}
              >
                Continue
              </button>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowWinPopup(false);
                }}
              >
                Board and Animate Solution
              </button>
            </div>
          </div>
        )}

        {showQuitConfirmation && (
          <div className="absolute w-screen h-screen bg-black bg-opacity-85 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg flex justify-center items-center flex-col">
              <h1 className="text-gray-900 text-lg mb-4">
                Are you sure you want to quit the game?
              </h1>
              <div className="flex space-x-4">
                <button
                  className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 transition-transform duration-300 ease-in-out"
                  onClick={confirmQuit}
                >
                  Yes, Quit
                </button>
                <button
                  className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-transform duration-300 ease-in-out"
                  onClick={cancelQuit}
                >
                  No, Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Game;
