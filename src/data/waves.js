const TYPE_ORDER = ["basic", "basic", "fast", "power", "armor"];

function clampArmor(stage) {
  return Math.min(8, Math.floor(stage / 6));
}

function clampPower(stage) {
  return Math.min(6, Math.floor((stage + 1) / 5));
}

function clampFast(stage) {
  return Math.min(7, Math.floor((stage + 2) / 4));
}

function createEnemyList(stage) {
  const total = 20;
  const armor = clampArmor(stage);
  const power = clampPower(stage);
  const fast = clampFast(stage);
  const basic = Math.max(0, total - armor - power - fast);

  const pool = [
    ...Array.from({ length: basic }, () => "basic"),
    ...Array.from({ length: fast }, () => "fast"),
    ...Array.from({ length: power }, () => "power"),
    ...Array.from({ length: armor }, () => "armor")
  ];

  const rotated = [];
  const stride = (stage % 5) + 2;
  let cursor = 0;

  while (pool.length) {
    cursor = (cursor + stride) % pool.length;
    rotated.push(pool.splice(cursor, 1)[0]);
  }

  return rotated;
}

function createBonusIndexes(stage) {
  const count = stage < 5 ? 2 : stage < 18 ? 3 : 4;
  const bonus = new Set();
  for (let index = 0; index < count; index += 1) {
    bonus.add((stage * 3 + index * 5) % 20);
  }
  return bonus;
}

function createWave(stage) {
  const enemies = createEnemyList(stage);
  const bonusIndexes = createBonusIndexes(stage);

  return {
    id: stage,
    spawnInterval: Math.max(1.1, 2 - stage * 0.015),
    enemies: enemies.map((type, index) => ({
      type: TYPE_ORDER.includes(type) ? type : "basic",
      bonus: bonusIndexes.has(index)
    }))
  };
}

export const WAVES = Array.from({ length: 50 }, (_, index) => createWave(index + 1));
