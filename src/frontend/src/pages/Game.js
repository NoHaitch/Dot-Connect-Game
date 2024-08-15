import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
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
  const [score, setScore] = useState(false);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  useEffect(() => {
    if (!username || !mode || !level) {
      navigate("/settings");
      return;
    }

    if (mode === "bot") {
      setShowJSONInput(true);
    } else if (mode === "manual" && boardType === "custom") {
      setShowJSONInput(true);
    } else {
      setShowStartGame(true);
    }

    localStorage.setItem("username", username);
  }, [username, mode, level, boardType, navigate]);

  const handleFileSelect = (data) => {
    setJsonFileData(data);
    setShowJSONInput(false);

    if (mode === "bot") {
      setShowAlgorithm(true);
    }

    setShowStartGame(true);
  };

  const handleStartGame = () => {
    setShowBackground(false);
    setShowGame(true);
    setIsTimerActive(true);
  };

  const handleWin = () => {
    setIsTimerActive(false);
    setShowWinPopup(true);
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
        {showGame && (
          <>
            <div className="absolute z-[] ml-[-800px]">
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

        {showBackground && (
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
            <div className="bg-white p-8 rounded-lg flex justify-center items-center flex-col">
              <h1 className="text-gray-900 text-lg mb-4">You Win!</h1>
              <h1>Score: {score} ms</h1>
              <button
                className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-700 transition-transform duration-300 ease-in-out mb-4"
                onClick={() => navigate("/settings")}
              >
                Continue
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
