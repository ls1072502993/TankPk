export const SFX = {
  fire: { type: "square", frequency: 260, duration: 0.08, attack: 0.005, decay: 0.06, volume: 0.08 },
  hitBrick: { type: "triangle", frequency: 180, duration: 0.07, attack: 0.002, decay: 0.05, volume: 0.06 },
  hitSteel: { type: "square", frequency: 100, duration: 0.07, attack: 0.001, decay: 0.05, volume: 0.05 },
  explosion: { type: "sawtooth", frequency: 90, duration: 0.22, attack: 0.001, decay: 0.18, volume: 0.1, noise: 0.2 },
  spawn: { type: "triangle", frequency: 520, duration: 0.2, attack: 0.01, decay: 0.18, volume: 0.05, sweep: -210 },
  pickup: { type: "square", frequency: 680, duration: 0.14, attack: 0.005, decay: 0.1, volume: 0.06, sweep: 180 },
  shield: { type: "triangle", frequency: 760, duration: 0.18, attack: 0.01, decay: 0.16, volume: 0.05, sweep: 90 },
  stageStart: { type: "triangle", frequency: 330, duration: 0.34, attack: 0.02, decay: 0.26, volume: 0.07, sweep: 220 },
  stageClear: { type: "triangle", frequency: 430, duration: 0.34, attack: 0.01, decay: 0.28, volume: 0.08, sweep: 180 },
  gameOver: { type: "sawtooth", frequency: 170, duration: 0.5, attack: 0.02, decay: 0.42, volume: 0.09, sweep: -90 }
};
