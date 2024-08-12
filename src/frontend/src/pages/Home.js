import React from "react";
import PageTitle from "../components/PageTitle";
import Leaderboard from "../components/Leaderboard";

function Home() {
  return (
    <>
      <PageTitle title="Dot Connect Home" />
      <div className="w-screen h-screen justify-center items-center">
        <div className="w-full p-4 pt-40 h-full bg-gradient-to-br from-[#7a2096] to-[#181818] flex flex-col items-center">
          <div>
            <h1 className="game-title text-9xl">Dot-Connect Game</h1>
          </div>
          <div className="flex flex-row m-4 items-center justify-center space-x-4 select-none">
            <button
              type="button"
              className="focus:outline-none text-black focus:ring-4 font-medium rounded-lg text-xl px-8 py-3 me-2 mb-2 bg-green-600 hover:bg-green-700 focus:ring-green-800"
            >
              New Game
            </button>
            <button
              type="button"
              className="focus:outline-none text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 font-medium rounded-lg text-xl px-8 py-3 me-2 mb-2 focus:ring-yellow-900"
            >
              Load Game
            </button>
          </div>
          <Leaderboard />
        </div>
      </div>
    </>
  );
}

export default Home;
