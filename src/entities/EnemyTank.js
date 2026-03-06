import { directionVector } from "../assets/sprites.js";

export const ENEMY_ARCHETYPES = {
  basic: { speed: 72, fireInterval: 1.5, hitPoints: 1, score: 100 },
  fast: { speed: 108, fireInterval: 1.15, hitPoints: 1, score: 200 },
  power: { speed: 84, fireInterval: 0.82, hitPoints: 1, score: 300 },
  armor: { speed: 76, fireInterval: 1.22, hitPoints: 4, score: 400 }
};

const DIRECTIONS = ["up", "down", "left", "right"];

export class EnemyTank {
  constructor({ x, y, enemyType = "basic", bonus = false }) {
    this.kind = "enemy";
    this.enemyType = enemyType;
    this.size = 28;
    this.x = x;
    this.y = y;
    this.direction = "down";
    this.moveDecisionTimer = 0;
    this.fireCooldown = Math.random() * 0.7 + 0.4;
    this.spawnShieldTimer = 1.1;
    this.dead = false;
    this.bonus = bonus;
    this.frozenTimer = 0;
    const config = ENEMY_ARCHETYPES[enemyType] ?? ENEMY_ARCHETYPES.basic;
    this.speed = config.speed;
    this.fireInterval = config.fireInterval;
    this.hitPoints = config.hitPoints;
    this.scoreValue = config.score;
  }

  update(deltaSeconds, target, moveResolver, canSeeBase) {
    this.spawnShieldTimer = Math.max(0, this.spawnShieldTimer - deltaSeconds);
    this.fireCooldown = Math.max(0, this.fireCooldown - deltaSeconds);
    this.moveDecisionTimer = Math.max(0, this.moveDecisionTimer - deltaSeconds);
    this.frozenTimer = Math.max(0, this.frozenTimer - deltaSeconds);

    if (this.frozenTimer > 0 || this.dead) {
      return;
    }

    if (this.moveDecisionTimer <= 0) {
      this.direction = this.pickDirection(target, canSeeBase);
      this.moveDecisionTimer = 0.25 + Math.random() * 0.45;
    }

    const vector = directionVector(this.direction);
    const moved = moveResolver(this, vector.x * this.speed * deltaSeconds, vector.y * this.speed * deltaSeconds);
    if (!moved) {
      this.direction = this.pickFallbackDirection();
      this.moveDecisionTimer = 0.08;
    }
  }

  pickDirection(target, canSeeBase) {
    if (canSeeBase && Math.random() < 0.6) {
      return "down";
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const priorities = Math.abs(dx) > Math.abs(dy)
      ? [dx < 0 ? "left" : "right", dy < 0 ? "up" : "down"]
      : [dy < 0 ? "up" : "down", dx < 0 ? "left" : "right"];

    while (priorities.length < 4) {
      const candidate = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      if (!priorities.includes(candidate)) {
        priorities.push(candidate);
      }
    }

    const biasBoost = this.enemyType === "fast" ? 0.55 : 0.8;
    return Math.random() < biasBoost ? priorities[0] : priorities[Math.floor(Math.random() * priorities.length)];
  }

  pickFallbackDirection() {
    const options = DIRECTIONS.filter((direction) => direction !== this.direction);
    return options[Math.floor(Math.random() * options.length)];
  }

  canFire() {
    return !this.dead && this.spawnShieldTimer <= 0 && this.fireCooldown <= 0 && this.frozenTimer <= 0;
  }

  createBullet() {
    if (!this.canFire()) {
      return null;
    }

    this.fireCooldown = this.fireInterval;
    const offset = this.size / 2;
    const tip = 10;
    const speed = this.enemyType === "power" ? 370 : 320;

    switch (this.direction) {
      case "up":
        return { x: this.x + offset, y: this.y - tip, direction: this.direction, speed, power: 1 };
      case "down":
        return { x: this.x + offset, y: this.y + this.size + tip - 2, direction: this.direction, speed, power: 1 };
      case "left":
        return { x: this.x - tip, y: this.y + offset, direction: this.direction, speed, power: 1 };
      default:
        return { x: this.x + this.size + tip - 2, y: this.y + offset, direction: this.direction, speed, power: 1 };
    }
  }

  damage() {
    if (this.spawnShieldTimer > 0) {
      return false;
    }
    this.hitPoints -= 1;
    if (this.hitPoints <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.size, height: this.size };
  }
}
