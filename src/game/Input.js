const KEY_TO_DIRECTION = new Map([
  ["ArrowUp", "up"],
  ["KeyW", "up"],
  ["ArrowDown", "down"],
  ["KeyS", "down"],
  ["ArrowLeft", "left"],
  ["KeyA", "left"],
  ["ArrowRight", "right"],
  ["KeyD", "right"]
]);

export class Input {
  constructor(target = window) {
    this.target = target;
    this.keys = new Set();
    this.pressed = new Set();

    this.handleKeyDown = (event) => {
      if (!this.keys.has(event.code)) {
        this.pressed.add(event.code);
      }
      this.keys.add(event.code);

      if (KEY_TO_DIRECTION.has(event.code) || ["KeyJ", "Space", "Enter", "KeyP"].includes(event.code)) {
        event.preventDefault();
      }
    };

    this.handleKeyUp = (event) => {
      this.keys.delete(event.code);
    };

    this.target.addEventListener("keydown", this.handleKeyDown);
    this.target.addEventListener("keyup", this.handleKeyUp);
  }

  getMovement() {
    const order = [
      ["ArrowUp", "up"],
      ["KeyW", "up"],
      ["ArrowDown", "down"],
      ["KeyS", "down"],
      ["ArrowLeft", "left"],
      ["KeyA", "left"],
      ["ArrowRight", "right"],
      ["KeyD", "right"]
    ];

    for (const [code, direction] of order) {
      if (this.keys.has(code)) {
        return direction;
      }
    }

    return null;
  }

  isFiring() {
    return this.keys.has("KeyJ") || this.keys.has("Space");
  }

  consumePressed(code) {
    const hadKey = this.pressed.has(code);
    this.pressed.delete(code);
    return hadKey;
  }

  destroy() {
    this.target.removeEventListener("keydown", this.handleKeyDown);
    this.target.removeEventListener("keyup", this.handleKeyUp);
  }
}
