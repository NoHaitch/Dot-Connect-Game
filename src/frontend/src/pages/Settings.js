import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import Leaderboard from "../components/Leaderboard";

function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || localStorage.getItem("username");

  const [mode, setMode] = useState("manual");
  const [level, setLevel] = useState("beginner");
  const [boardType, setBoardType] = useState("custom");

  useEffect(() => {
    if (!username) {
      navigate("/");
    } else {
      localStorage.setItem("username", username);
    }
  }, [username, navigate]);

  const handlePlay = () => {
    navigate("/game", { state: { username, mode, level, boardType } });
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  if (!username) {
    return null;
  }

  return (
    <>
      <PageTitle title="Dot-Connect Settings" />
      <div className="w-screen h-screen justify-center items-center">
        <div className="w-full p-4 h-full bg-gradient-to-br from-[#e27f2e] to-[#1b0900] flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 m-2 scale-[0.75] bg-black bg-opacity-35 rounded-lg">
            <Leaderboard />
          </div>
          <h1 className="text-6xl drop-shadow-lg m-2 font-bold text-gray-300">
            Settings
          </h1>
          <div className="bg-white bg-opacity-20 m-4 p-8 rounded-lg flex flex-col items-center">
            <div className="flex flex-col items-center space-y-4 mb-4">
              <div className="flex flex-col text-center justify-center">
                <h1 className="mb-2">Mode</h1>
                <div className="flex space-x-3">
                  <button
                    className={`py-2 px-4 rounded w-[88px] text-center transition-transform duration-300 ease-in-out bg-blue-400 ${
                      mode === "bot"
                        ? "text-gray-900 scale-110"
                        : "text-gray-800 opacity-50"
                    }`}
                    onClick={() => setMode("bot")}
                  >
                    Bot
                  </button>
                  <button
                    className={`py-2 px-4 rounded w-[88px] text-center transition-transform duration-300 ease-in-out bg-blue-400 ${
                      mode === "manual"
                        ? "text-gray-900 scale-110"
                        : "text-gray-800 opacity-50"
                    }`}
                    onClick={() => setMode("manual")}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div className="flex flex-col text-center justify-center">
                <h1 className="mb-2">Levels</h1>
                <div className="flex space-x-3">
                  <button
                    className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out ${
                      level === "beginner"
                        ? "bg-green-400 text-gray-900 scale-110"
                        : "bg-green-400 text-gray-800 opacity-50"
                    }`}
                    onClick={() => setLevel("beginner")}
                  >
                    Beginner
                  </button>
                  <button
                    className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out ${
                      level === "easy"
                        ? "bg-lime-400 text-gray-900 scale-110"
                        : "bg-lime-400 text-gray-800 opacity-50"
                    }`}
                    onClick={() => setLevel("easy")}
                  >
                    Easy
                  </button>
                  <button
                    className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out ${
                      level === "medium"
                        ? "bg-orange-400 text-gray-900 scale-110"
                        : "bg-orange-400 text-gray-800 opacity-50"
                    }`}
                    onClick={() => setLevel("medium")}
                  >
                    Medium
                  </button>
                  <button
                    className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out ${
                      level === "hard"
                        ? "bg-red-400 text-gray-900 scale-110"
                        : "bg-red-400 text-gray-800 opacity-50"
                    }`}
                    onClick={() => setLevel("hard")}
                  >
                    Hard
                  </button>
                </div>
              </div>

              {mode === "manual" && (
                <div className="flex flex-col text-center justify-center mt-4">
                  <h1 className="mb-2">Board Customization</h1>
                  <div className="flex space-x-3">
                    <button
                      className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out ${
                        boardType === "random"
                          ? "bg-purple-400 text-gray-900 scale-110"
                          : "bg-purple-400 text-gray-800 opacity-50"
                      }`}
                      onClick={() => setBoardType("random")}
                    >
                      Random Board
                    </button>
                    <button
                      className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out ${
                        boardType === "custom"
                          ? "bg-purple-400 text-gray-900 scale-110"
                          : "bg-purple-400 text-gray-800 opacity-50"
                      }`}
                      onClick={() => setBoardType("custom")}
                    >
                      Custom Board
                    </button>
                  </div>
                </div>
              )}

              <hr className="h-4" />
              <button
                className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-700 transition-transform duration-300 ease-in-out mb-4"
                onClick={handlePlay}
              >
                Play
              </button>
            </div>
          </div>
          <h1 className="text-white">Currently logged in as</h1>
          <h1 className="text-white underline">{username}</h1>
          <button
            className="scale-75 px-6 py-3 mt-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-700 transition-transform duration-300 ease-in-out"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Settings;
