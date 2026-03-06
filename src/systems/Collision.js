export class CollisionSystem {
  constructor(tileSize = 16, playfieldSize = 416) {
    this.tileSize = tileSize;
    this.playfieldSize = playfieldSize;
  }

  rectsOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  clampTank(rect) {
    rect.x = Math.max(0, Math.min(this.playfieldSize - rect.width, rect.x));
    rect.y = Math.max(0, Math.min(this.playfieldSize - rect.height, rect.y));
  }

  getTileAtPixel(tiles, x, y) {
    const tileX = Math.max(0, Math.min(25, Math.floor(x / this.tileSize)));
    const tileY = Math.max(0, Math.min(25, Math.floor(y / this.tileSize)));
    return {
      tileX,
      tileY,
      tile: tiles[tileY]?.[tileX] ?? { type: "empty" }
    };
  }

  isSolidForTank(tile) {
    return tile.type === "brick" || tile.type === "steel" || tile.type === "water";
  }

  isSolidForBullet(tile) {
    return tile.type === "brick" || tile.type === "steel";
  }

  collidesWithTerrain(rect, tiles) {
    const startX = Math.floor(rect.x / this.tileSize);
    const endX = Math.floor((rect.x + rect.width - 1) / this.tileSize);
    const startY = Math.floor(rect.y / this.tileSize);
    const endY = Math.floor((rect.y + rect.height - 1) / this.tileSize);

    for (let tileY = startY; tileY <= endY; tileY += 1) {
      for (let tileX = startX; tileX <= endX; tileX += 1) {
        const tile = tiles[tileY]?.[tileX];
        if (tile && this.isSolidForTank(tile)) {
          return true;
        }
      }
    }

    return false;
  }

  moveTank(tank, dx, dy, tiles, tanks = []) {
    const next = tank.getBounds();
    next.x += dx;
    next.y += dy;
    this.clampTank(next);

    if (this.collidesWithTerrain(next, tiles)) {
      return false;
    }

    for (const other of tanks) {
      if (!other || other === tank || other.dead) {
        continue;
      }
      if (this.rectsOverlap(next, other.getBounds())) {
        return false;
      }
    }

    tank.x = next.x;
    tank.y = next.y;
    return true;
  }

  destroyTile(tiles, tileX, tileY, power) {
    const tile = tiles[tileY]?.[tileX];
    if (!tile) {
      return null;
    }
    if (tile.type === "brick") {
      tile.type = "empty";
      return "brick";
    }
    if (tile.type === "steel" && power > 1) {
      tile.type = "empty";
      return "steel";
    }
    if (tile.type === "steel") {
      return "steel";
    }
    return null;
  }
}
