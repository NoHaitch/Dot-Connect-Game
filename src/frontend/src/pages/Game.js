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
  const [algorithm, setAlgorithm] = useState("DFS");

  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [newHighscore, setNewHighscore] = useState(false);
  const [score, setScore] = useState(false);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [isFetchingBoard, setIsFetchingBoard] = useState(false);

  useEffect(() => {
    
    if (!username || !mode || !level) {
      navigate("/settings");
      return;
    }
    
    if(!boardType || mode === 'bot'){
      boardType = 'custom'
    }

    console.log(mode);
    console.log(level);
    console.log(boardType);
    

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
      const response = await fetch(`http://localhost:8080/generateRandom?level=${level}`);
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
              <h1 className="text-gray-900 text-lg mb-4">Generating board...</h1>
            </div>
          </div>
        )}

        {showGame && (
          <>
            <div className="absolute ml-[-800px]">
              <Timer isActive={isTimerActive} onTimeUpdate={handleTimeUpdate} />
            </div>
            {mode === "manual" ? (
              <div className="flex flex-col justify-center items-center">
                <div className="m-2 font-bold text-gray-700 text-center">
                  <p>Left Click to make a path</p>
                  <p>Right Click to reset the path</p>
                </div>
                <Board board={jsonFileData.board} onWin={handleWin} />
              </div>
            ) : (
              <Board board={jsonFileData.board} onWin={handleWin} />
            )}
            <div className="absolute bottom-5 left-5">
              <button
                onClick={handleBackToSettings}
                className="flex flex-row justify-center items-center w-[250px] hover:text-slate-700"
              >
                <RiArrowGoBackFill className="m-2" /> Back to Settings
              </button>
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
                          algorithm === "DFS"
                            ? "text-gray-900 scale-110"
                            : "text-gray-800 opacity-50"
                        }`}
                        onClick={() => setAlgorithm("DFS")}
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
                onClick={() => setShowWinPopup(false)}
              >
                Look at the Board
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
