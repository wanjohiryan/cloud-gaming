import React from "react";

import GameList from "../../components/GameList";

import "./style.scss";

export default function GameChoice() {
  return (
    <div className="game-choice">
      <h1 className="game-choice__title">Choose a game</h1>
      <GameList />
    </div>
  );
}
