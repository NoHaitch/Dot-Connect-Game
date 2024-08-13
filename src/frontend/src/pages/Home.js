import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import Leaderboard from "../components/Leaderboard";

function Home() {
  const [NewGame, setNewGame] = useState(false);
  const [LoadGame, setLoadGame] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      navigate("/settings", { state: { username: storedUsername } });
    }
  }, [navigate]);

  const startNewGame = async () => {
    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.response) {
        console.log("Game Started!");
        setNewGame(false);
        navigate("/settings", { state: { username } });
      } else {
        setError("Username already taken.");
      }
    } catch (err) {
      setError("Error connecting to the server. Please try again later.");
    }
  };

  const loadGame = async () => {
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.response) {
        console.log("Game Loaded!");
        setLoadGame(false);
        navigate("/settings", { state: { username } });
      } else {
        setError("Incorrect username or password.");
      }
    } catch (err) {
      setError("Error connecting to the server. Please try again later.");
    }
  };

  return (
    <>
      <PageTitle title="Dot-Connect Home" />
      <div className="w-screen h-screen justify-center items-center">
        <div className="w-full p-4 pt-40 h-full bg-gradient-to-br from-[#7a2096] to-[#181818] flex flex-col items-center">
          <div>
            <h1 className="game-title text-9xl">Dot-Connect Game</h1>
          </div>
          <div className="flex flex-row m-4 items-center justify-center space-x-4 select-none">
            <button
              type="button"
              className="focus:outline-none text-black focus:ring-4 font-medium rounded-lg text-xl px-8 py-3 me-2 mb-2 bg-green-600 hover:bg-green-700 focus:ring-green-800"
              onClick={() => setNewGame(true)}
            >
              New Game
            </button>
            <button
              type="button"
              className="focus:outline-none text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 font-medium rounded-lg text-xl px-8 py-3 me-2 mb-2 focus:ring-yellow-900"
              onClick={() => setLoadGame(true)}
            >
              Load Game
            </button>
          </div>
          <Leaderboard />
        </div>

        {/* New Game Pop-up */}
        {NewGame && (
          <div className="absolute w-full h-full bg-black top-0 left-0 z-20 bg-opacity-60 flex justify-center items-center">
            <div className="bg-[#e9f172] w-[400px] p-6 rounded-lg flex flex-col items-center relative">
              <button
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
                onClick={() => {
                  setNewGame(false);
                  setUsername("");
                  setPassword("");
                }}
              >
                ✖
              </button>
              <h1 className="text-2xl font-bold mb-4">New Game</h1>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="newGamePassword"
                  type="password"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p>
                Already played before?{" "}
                <button
                  className="text-blue-800 hover:underline"
                  onClick={() => {
                    setNewGame(false);
                    setUsername("");
                    setPassword("");
                    setLoadGame(true);
                  }}
                >
                  Load game
                </button>{" "}
                instead!
              </p>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <button
                type="button"
                className="mt-4 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
                onClick={() => {
                  if (username !== "" && password !== "") {
                    startNewGame();
                  } else {
                    setError("Username and Password must not be empty.");
                  }
                }}
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Load Game Pop-up */}
        {LoadGame && (
          <div className="absolute w-full h-full bg-black top-0 left-0 z-20 bg-opacity-60 flex justify-center items-center">
            <div className="bg-[#f3bf71] w-[400px] p-6 rounded-lg flex flex-col items-center relative">
              <button
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
                onClick={() => {
                  setLoadGame(false);
                  setUsername("");
                  setPassword("");
                }}
              >
                ✖
              </button>
              <h1 className="text-2xl font-bold mb-4">Load Game</h1>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p>
                New here?{" "}
                <button
                  className="text-blue-800 hover:underline"
                  onClick={() => {
                    setLoadGame(false);
                    setUsername("");
                    setPassword("");
                    setNewGame(true);
                  }}
                >
                  Start a new game
                </button>{" "}
                instead!
              </p>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <button
                type="button"
                className="mt-4 px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
                onClick={() => {
                  if (username !== "" && password !== "") {
                    loadGame();
                  } else {
                    setError("Username and Password must not be empty.");
                  }
                }}
              >
                Load Game
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
