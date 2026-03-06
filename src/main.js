import { Game } from "./game/Game.js";

const canvas = document.getElementById("game");
const overlay = document.getElementById("overlay");

if (!canvas) {
  throw new Error("Canvas element #game not found.");
}

const game = new Game({ canvas, overlay });
game.start();
