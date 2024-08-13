// src/components/JSONFilePicker.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import { RiArrowGoBackFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const JSONFilePicker = ({ onFileSelect, level }) => {
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/json") {
        setError("");
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            if (validateJSON(json, level)) {
              onFileSelect(json);
            } else {
              setError("Invalid JSON format for this level.");
            }
          } catch (err) {
            setError("Invalid JSON file.");
          }
        };
        reader.readAsText(file);
      } else {
        setError("Please select a valid JSON file.");
      }
    }
  };

  const validateJSON = (json, level) => {
    const boardDimensions = {
      beginner: { rows: 5, cols: 5 },
      easy: { rows: 8, cols: 6 },
      medium: { rows: 10, cols: 6 },
      hard: { rows: 12, cols: 8 },
    };

    const { rows, cols } = boardDimensions[level.toLowerCase()] || {};

    if (!json.board || !Array.isArray(json.board)) {
      return false;
    }

    if (json.board.length !== rows) {
      return false;
    }

    let countOfTwos = 0;

    for (const row of json.board) {
      if (!Array.isArray(row) || row.length !== cols) {
        return false;
      }

      for (const cell of row) {
        if (![0, 1, 2].includes(cell)) {
          return false;
        }
        if (cell === 2) {
          countOfTwos += 1;
        }
      }
    }

    if (countOfTwos !== 1) {
      return false;
    }

    return true;
  };

  return (
    <div className="p-8 rounded-lg flex justify-center items-center flex-col bg-purple-700">
      <h1 className="text-white text-lg text-center">
        Please choose a JSON file to input the board
      </h1>
      <h2 className="text-gray-400 mb-4 ">Level: {level}</h2>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="mb-4 text-white m-4"
      />
      {error && <p className="text-red-500">{error}</p>}
      <Link
        to="/settings"
        className="text-gray-800 flex flex-row justify-center items-center w-[250px] hover:text-gray-700"
      >
        <RiArrowGoBackFill className="m-2" /> Go Back
      </Link>
    </div>
  );
};

JSONFilePicker.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  level: PropTypes.string.isRequired,
};

export default JSONFilePicker;
