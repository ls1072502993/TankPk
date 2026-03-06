export class Base {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.destroyed = false;
  }

  reset() {
    this.destroyed = false;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.size, height: this.size };
  }
}
