import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { RiArrowGoBackFill } from "react-icons/ri";
import PageTitle from "../components/PageTitle";
import JSONFilePicker from "../components/JSONFilePicker";

function Game() {
  const location = useLocation();
  const navigate = useNavigate();

  const username = location.state?.username || localStorage.getItem("username");
  const mode = location.state?.mode;
  const level = location.state?.level;
  const boardType = location.state?.boardType;

  const [showContent, setShowContent] = useState(false);
  const [showJSONInput, setShowJSONInput] = useState(false);
  const [showBackground, setShowBackground] = useState(true);
  const [jsonFileData, setJsonFileData] = useState(null);

  useEffect(() => {
    if (!username || !mode || !level) {
      navigate("/settings");
      return;
    }

    if (boardType === "custom") {
      setShowJSONInput(true);
    } else {
      performLogic();
    }

    localStorage.setItem("username", username);
  }, [username, mode, level, boardType, navigate]);

  const performLogic = () => {
    setTimeout(() => {
      setShowContent(true);
    }, 3000);
  };

  if (!username || !mode || !level) {
    return null;
  }

  const handleFileSelect = (data) => {
    setJsonFileData(data);
    setShowJSONInput(false);
    performLogic();
    console.log(jsonFileData);
  };

  const handleStartGame = () => {
    setShowBackground(false);
  };

  return (
    <>
      <PageTitle title="Dot-Connect Game" />
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#5bffa0] to-[#1b0900]">
        {showContent && <div>BOARD</div>}

        {showBackground && (
          <div className="absolute w-screen h-screen bg-black bg-opacity-85 flex justify-center items-center">
            {showJSONInput && (
              <JSONFilePicker onFileSelect={handleFileSelect} level={level} />
            )}
            {showContent && !showJSONInput && (
              <div className="p-8 rounded-lg flex justify-center items-center flex-col">
                <h1 className="text-white text-lg mb-4">
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
      </div>
    </>
  );
}

export default Game;
