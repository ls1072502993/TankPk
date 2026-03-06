import { directionVector } from "../assets/sprites.js";

export class PlayerTank {
  constructor(spawnPoint) {
    this.kind = "player";
    this.spawnPoint = { ...spawnPoint };
    this.size = 28;
    this.baseSpeed = 92;
    this.direction = "up";
    this.fireCooldown = 0;
    this.bulletsInFlight = 0;
    this.slideTimer = 0;
    this.lives = 3;
    this.score = 0;
    this.level = 0;
    this.shieldTimer = 0;
    this.dead = false;
    this.spawn(spawnPoint, true);
  }

  spawn(spawnPoint = this.spawnPoint, keepLevel = false) {
    this.spawnPoint = { ...spawnPoint };
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.dead = false;
    this.direction = "up";
    this.fireCooldown = 0;
    this.bulletsInFlight = 0;
    this.slideTimer = 0.16;
    this.shieldTimer = 3;
    if (!keepLevel) {
      this.level = 0;
    }
  }

  get speed() {
    return this.baseSpeed + this.level * 8;
  }

  get maxBullets() {
    return this.level >= 2 ? 2 : 1;
  }

  get bulletPower() {
    return this.level >= 3 ? 2 : 1;
  }

  get bulletSpeed() {
    return this.level >= 1 ? 390 : 340;
  }

  get fireInterval() {
    return this.level >= 2 ? 0.22 : 0.34;
  }

  update(deltaSeconds, inputDirection, moveResolver, tileResolver) {
    this.fireCooldown = Math.max(0, this.fireCooldown - deltaSeconds);
    this.shieldTimer = Math.max(0, this.shieldTimer - deltaSeconds);
    this.slideTimer = Math.max(0, this.slideTimer - deltaSeconds);

    let direction = inputDirection;
    const tile = tileResolver(this.x + this.size / 2, this.y + this.size / 2);
    const onIce = tile?.type === "ice";

    if (!direction && onIce && this.slideTimer > 0) {
      direction = this.direction;
    }

    if (direction) {
      this.direction = direction;
      this.slideTimer = onIce ? 0.18 : 0;
      const vector = directionVector(direction);
      moveResolver(this, vector.x * this.speed * deltaSeconds, vector.y * this.speed * deltaSeconds);
    }
  }

  canFire() {
    return !this.dead && this.fireCooldown <= 0 && this.bulletsInFlight < this.maxBullets;
  }

  createBullet() {
    if (!this.canFire()) {
      return null;
    }

    this.fireCooldown = this.fireInterval;
    this.bulletsInFlight += 1;
    const offset = this.size / 2;
    const tip = 10;

    switch (this.direction) {
      case "up":
        return { x: this.x + offset, y: this.y - tip, direction: this.direction, speed: this.bulletSpeed, power: this.bulletPower };
      case "down":
        return { x: this.x + offset, y: this.y + this.size + tip - 2, direction: this.direction, speed: this.bulletSpeed, power: this.bulletPower };
      case "left":
        return { x: this.x - tip, y: this.y + offset, direction: this.direction, speed: this.bulletSpeed, power: this.bulletPower };
      default:
        return { x: this.x + this.size + tip - 2, y: this.y + offset, direction: this.direction, speed: this.bulletSpeed, power: this.bulletPower };
    }
  }

  upgrade() {
    this.level = Math.min(3, this.level + 1);
  }

  addLife() {
    this.lives += 1;
  }

  hit() {
    if (this.shieldTimer > 0 || this.dead) {
      return false;
    }
    this.dead = true;
    this.lives -= 1;
    return true;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.size, height: this.size };
  }
}
