function createGrid(fill = ".") {
  return Array.from({ length: 13 }, () => Array.from({ length: 13 }, () => fill));
}

function keepBaseLaneClear(grid) {
  for (let y = 10; y < 13; y += 1) {
    for (let x = 4; x <= 8; x += 1) {
      grid[y][x] = ".";
    }
  }

  grid[0][1] = ".";
  grid[0][6] = ".";
  grid[0][11] = ".";
  grid[1][1] = ".";
  grid[1][6] = ".";
  grid[1][11] = ".";
}

function drawHorizontal(grid, y, x1, x2, tile) {
  for (let x = x1; x <= x2; x += 1) {
    if (grid[y] && grid[y][x] !== undefined) {
      grid[y][x] = tile;
    }
  }
}

function drawVertical(grid, x, y1, y2, tile) {
  for (let y = y1; y <= y2; y += 1) {
    if (grid[y] && grid[y][x] !== undefined) {
      grid[y][x] = tile;
    }
  }
}

function mirrorStamp(grid, y, x, tile) {
  const pairX = 12 - x;
  if (grid[y]?.[x] !== undefined) {
    grid[y][x] = tile;
  }
  if (grid[y]?.[pairX] !== undefined) {
    grid[y][pairX] = tile;
  }
}

function fillRect(grid, x1, y1, x2, y2, tile) {
  for (let y = y1; y <= y2; y += 1) {
    for (let x = x1; x <= x2; x += 1) {
      if (grid[y]?.[x] !== undefined) {
        grid[y][x] = tile;
      }
    }
  }
}

function addRivers(grid, stage) {
  const riverColumn = (stage * 3) % 5 + 2;
  drawVertical(grid, riverColumn, 2, 8, "W");
  drawVertical(grid, 12 - riverColumn, 2, 8, "W");
  if (stage % 2 === 0) {
    drawHorizontal(grid, 6, 3, 9, "W");
  }
}

function addSteelStrongholds(grid, stage) {
  const offset = stage % 3;
  fillRect(grid, 2, 2 + offset, 3, 3 + offset, "S");
  fillRect(grid, 9, 2 + offset, 10, 3 + offset, "S");
  if (stage > 20) {
    fillRect(grid, 5, 4, 7, 5, "S");
  }
  if (stage > 36) {
    fillRect(grid, 5, 8, 7, 9, "S");
  }
}

function addForests(grid, stage) {
  for (let y = 1; y <= 9; y += 2) {
    const x = (stage + y) % 4 + 1;
    mirrorStamp(grid, y, x, "F");
  }
  if (stage % 3 === 0) {
    fillRect(grid, 4, 7, 8, 8, "F");
  }
}

function addIce(grid, stage) {
  if (stage < 8) {
    return;
  }

  const start = stage % 2 === 0 ? 1 : 2;
  drawHorizontal(grid, 10, start, 12 - start, "I");
  if (stage > 25) {
    drawHorizontal(grid, 4, start, 12 - start, "I");
  }
}

function addBricks(grid, stage) {
  for (let ring = 0; ring < 3; ring += 1) {
    const inset = ring + 1;
    const tile = ring === 1 && stage > 30 ? "S" : "B";
    drawHorizontal(grid, inset, inset, 12 - inset, tile);
    drawHorizontal(grid, 12 - inset, inset, 12 - inset, tile);
    drawVertical(grid, inset, inset, 12 - inset, tile);
    drawVertical(grid, 12 - inset, inset, 12 - inset, tile);
  }

  const middle = stage % 4;
  if (middle === 0) {
    drawVertical(grid, 6, 2, 10, "B");
  } else if (middle === 1) {
    drawHorizontal(grid, 6, 2, 10, "B");
  } else if (middle === 2) {
    for (let step = 2; step <= 10; step += 2) {
      grid[step][step] = "B";
      grid[step][12 - step] = "B";
    }
  } else {
    fillRect(grid, 4, 4, 8, 8, "B");
  }
}

function carveRoutes(grid, stage) {
  const corridorX = stage % 2 === 0 ? 3 : 9;
  drawVertical(grid, corridorX, 0, 12, ".");
  drawVertical(grid, 12 - corridorX, 0, 12, ".");
  drawHorizontal(grid, 11, 0, 12, ".");
  drawHorizontal(grid, 5, 0, 12, stage > 10 ? "." : grid[5][6]);
  drawVertical(grid, 6, 0, 3, ".");
  if (stage % 5 === 0) {
    drawHorizontal(grid, 7, 0, 12, ".");
  }
}

function finalizeStage(grid) {
  keepBaseLaneClear(grid);
  return grid.map((row) => row.join(""));
}

function createStage(stageNumber) {
  const grid = createGrid();
  addBricks(grid, stageNumber);
  addRivers(grid, stageNumber);
  addSteelStrongholds(grid, stageNumber);
  addForests(grid, stageNumber);
  addIce(grid, stageNumber);
  carveRoutes(grid, stageNumber);
  keepBaseLaneClear(grid);

  return {
    id: stageNumber,
    name: `Stage ${String(stageNumber).padStart(2, "0")}`,
    rows: finalizeStage(grid)
  };
}

export const STAGES = Array.from({ length: 50 }, (_, index) => createStage(index + 1));
