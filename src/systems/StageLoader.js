import { STAGES } from "../data/stages.js";
import { WAVES } from "../data/waves.js";

const TILE_BY_CHAR = {
  ".": "empty",
  B: "brick",
  S: "steel",
  W: "water",
  F: "forest",
  I: "ice"
};

function duplicateTile(type) {
  return [{ type }, { type }];
}

function expandRow(row) {
  const top = [];
  const bottom = [];
  for (const char of row) {
    const type = TILE_BY_CHAR[char] ?? "empty";
    top.push(...duplicateTile(type));
    bottom.push(...duplicateTile(type));
  }
  return [top, bottom];
}

function createFortressTiles(steel = false) {
  const wallType = steel ? "steel" : "brick";
  return [
    { x: 11, y: 23, type: wallType },
    { x: 12, y: 23, type: wallType },
    { x: 13, y: 23, type: wallType },
    { x: 14, y: 23, type: wallType },
    { x: 11, y: 24, type: wallType },
    { x: 14, y: 24, type: wallType },
    { x: 11, y: 25, type: wallType },
    { x: 14, y: 25, type: wallType }
  ];
}

function clearArea(tiles, tileX, tileY, width, height) {
  for (let y = tileY; y < tileY + height; y += 1) {
    for (let x = tileX; x < tileX + width; x += 1) {
      if (tiles[y] && tiles[y][x]) {
        tiles[y][x].type = "empty";
      }
    }
  }
}

export class StageLoader {
  constructor(tileSize = 16) {
    this.tileSize = tileSize;
  }

  load(stageNumber) {
    const safeIndex = ((stageNumber - 1) % STAGES.length + STAGES.length) % STAGES.length;
    const stage = STAGES[safeIndex];
    const wave = WAVES[safeIndex];
    const tiles = [];

    for (const row of stage.rows) {
      const [top, bottom] = expandRow(row);
      tiles.push(top, bottom);
    }

    clearArea(tiles, 0, 0, 2, 2);
    clearArea(tiles, 12, 0, 2, 2);
    clearArea(tiles, 24, 0, 2, 2);
    clearArea(tiles, 8, 24, 2, 2);

    this.applyFortress(tiles, false);

    return {
      id: stage.id,
      name: stage.name,
      tiles,
      wave,
      playerSpawn: { x: 8 * this.tileSize, y: 24 * this.tileSize },
      enemySpawns: [
        { x: 0 * this.tileSize, y: 0 },
        { x: 12 * this.tileSize, y: 0 },
        { x: 24 * this.tileSize, y: 0 }
      ],
      base: { x: 12 * this.tileSize, y: 24 * this.tileSize }
    };
  }

  applyFortress(tiles, steel = false) {
    for (const entry of createFortressTiles(steel)) {
      if (tiles[entry.y] && tiles[entry.y][entry.x]) {
        tiles[entry.y][entry.x].type = entry.type;
      }
    }
  }
}
