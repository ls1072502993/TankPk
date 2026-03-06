import { directionVector } from "../assets/sprites.js";

export class Bullet {
  constructor({ x, y, direction, owner, speed = 330, power = 1 }) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.owner = owner;
    this.speed = speed;
    this.power = power;
    this.radius = 4;
    this.dead = false;
    this.fromPlayer = owner?.kind === "player";
  }

  update(deltaSeconds) {
    const vector = directionVector(this.direction);
    this.x += vector.x * this.speed * deltaSeconds;
    this.y += vector.y * this.speed * deltaSeconds;
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2
    };
  }
}
