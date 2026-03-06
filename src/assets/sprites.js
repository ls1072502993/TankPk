export const PALETTE = {
  background: "#121212",
  battlefield: "#181818",
  panel: "#7a7a7a",
  panelShadow: "#303030",
  brickLight: "#c66a31",
  brickDark: "#7f351d",
  steelLight: "#d2d2d2",
  steelDark: "#636363",
  waterA: "#1d4dd6",
  waterB: "#58a6ff",
  forestA: "#2d8f31",
  forestB: "#0e5116",
  iceA: "#cfeafe",
  iceB: "#81b7da",
  base: "#e2b13c",
  baseShadow: "#7f4f14",
  text: "#d7d7d7",
  orange: "#e89a35",
  yellow: "#f3d34a",
  red: "#d86a56",
  green: "#8acf5b",
  black: "#000000",
  white: "#ffffff"
};

export const TILE_COLORS = {
  empty: null,
  brick: [PALETTE.brickLight, PALETTE.brickDark],
  steel: [PALETTE.steelLight, PALETTE.steelDark],
  water: [PALETTE.waterA, PALETTE.waterB],
  forest: [PALETTE.forestA, PALETTE.forestB],
  ice: [PALETTE.iceA, PALETTE.iceB]
};

export const TANK_COLORS = {
  player: { body: "#e6c05b", trim: "#6d5625" },
  player2: { body: "#61d2ff", trim: "#164d63" },
  basic: { body: "#d2d2d2", trim: "#555555" },
  fast: { body: "#d98737", trim: "#693610" },
  power: { body: "#89d954", trim: "#2e5416" },
  armor: { body: "#e7e7a6", trim: "#767645" },
  bonus: { body: "#f6dd5e", trim: "#8f6218" }
};

export const BONUS_COLORS = {
  star: "#f3d34a",
  helmet: "#60c4ff",
  shovel: "#d48a43",
  grenade: "#f25f5c",
  clock: "#91d66f",
  tank: "#f2f2f2"
};

export function directionVector(direction) {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    default:
      return { x: 1, y: 0 };
  }
}
