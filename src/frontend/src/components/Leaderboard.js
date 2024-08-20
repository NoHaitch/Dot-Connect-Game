import React, { useState, useEffect } from "react";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("bot");
  const [level, setLevel] = useState("beginner");
  const [boardType, setBoardType] = useState("random");

  useEffect(() => {
    // Set boardType based on mode
    const currentBoardType = mode === "bot" ? "custom" : boardType;

    // Fetch leaderboard data from the API
    fetch(`http://localhost:8080/leaderboard?mode=${mode}&level=${level}&boardType=${currentBoardType}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.leaderboard === null || data.leaderboard.length === 0) {
          setLeaderboard(null);
        } else if (Array.isArray(data.leaderboard)) {
          setLeaderboard(data.leaderboard);
        } else {
          setError("Unexpected data format");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Server Error: Failed to Fetch data");
        setLoading(false);
      });
  }, [mode, level, boardType]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="py-4 px-8 m-4 max-w-4xl mx-auto bg-white bg-opacity-20 rounded-lg shadow-lg">
      <h1 className="text-yellow-100 text-2xl font-bold mb-4 text-center">
        Leaderboard
      </h1>

      <div className="mb-4">
        <div className="flex flex-col items-center space-y-4 mb-4">
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
          {mode === 'manual' && (<div className="flex space-x-3">
            <button
              className={`py-2 px-4 rounded w-[88px] text-center transition-transform duration-300 ease-in-out bg-gray-400 ${
                boardType === "random"
                  ? "text-gray-900 scale-110"
                  : "text-gray-800 opacity-50"
              }`}
              onClick={() => setBoardType("random")}
            >
              Random
            </button>
            <button
              className={`py-2 px-4 rounded w-[88px] text-center transition-transform duration-300 ease-in-out bg-gray-400 ${
                boardType === "custom"
                  ? "text-gray-900 scale-110"
                  : "text-gray-800 opacity-50"
              }`}
              onClick={() => setBoardType("custom")}
            >
              Custom
            </button>
          </div>)}

          <div className="flex space-x-3">
            <button
              className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out bg-green-400 ${
                level === "beginner"
                  ? "text-gray-900 scale-110"
                  : "text-gray-800 opacity-50"
              }`}
              onClick={() => setLevel("beginner")}
            >
              Beginner
            </button>
            <button
              className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out bg-lime-400 ${
                level === "easy"
                  ? "text-gray-900 scale-110"
                  : "text-gray-800 opacity-50"
              }`}
              onClick={() => setLevel("easy")}
            >
              Easy
            </button>
            <button
              className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out bg-orange-400 ${
                level === "medium"
                  ? "text-gray-900 scale-110"
                  : "text-gray-800 opacity-50"
              }`}
              onClick={() => setLevel("medium")}
            >
              Medium
            </button>
            <button
              className={`py-2 px-4 rounded w-[96px] transition-transform duration-300 ease-in-out bg-red-400 ${
                level === "hard"
                  ? "text-gray-900 scale-110"
                  : "text-gray-800 opacity-50"
              }`}
              onClick={() => setLevel("hard")}
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500 p-4">{error}</div>
      ) : leaderboard === null || leaderboard.length === 0 ? (
        <div className="text-center p-4">
          No scores available for this selection.
        </div>
      ) : (
        <div className="flex justify-center overflow-x-auto ">
          <table className="min-w-fullshadow-md rounded-lg bg-black bg-opacity-5 m-2">
            <thead>
              <tr className="uppercase text-sm leading-normal border-b text-white">
                <th className="py-3 px-6 text-center">Rank</th>
                <th className="py-3 px-6 text-center">Username</th>
                <th className="py-3 px-6 text-center">Highscore</th>
              </tr>
            </thead>
            <tbody className="">
              {leaderboard.map((user, index) => (
                <tr
                  key={user.username}
                  className="border-b text-slate-300"
                >
                  <td className="py-3 px-6 text-center">{index + 1}</td>
                  <td className="py-3 px-6">{user.username}</td>
                  <td className="py-3 px-6 text-center">{user.highscore} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
