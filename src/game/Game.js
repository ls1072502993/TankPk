import { AudioManager } from "./Audio.js";
import { Renderer } from "./Renderer.js";
import { Input } from "./Input.js";
import { PlayerTank } from "../entities/PlayerTank.js";
import { EnemyTank } from "../entities/EnemyTank.js";
import { Bullet } from "../entities/Bullet.js";
import { Base } from "../entities/Base.js";
import { CollisionSystem } from "../systems/Collision.js";
import { StageLoader } from "../systems/StageLoader.js";

const BONUS_TYPES = ["star", "helmet", "grenade", "shovel", "clock", "tank"];

export class Game {
  constructor({ canvas, overlay }) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.tileSize = 16;
    this.playfieldSize = 416;
    this.input = new Input(window);
    this.audio = new AudioManager();
    this.renderer = new Renderer(canvas);
    this.collision = new CollisionSystem(this.tileSize, this.playfieldSize);
    this.loader = new StageLoader(this.tileSize);
    this.resetRuntime();
    this.loop = this.loop.bind(this);
  }

  resetRuntime() {
    this.scene = "title";
    this.stage = 1;
    this.stageTimer = 0;
    this.spawnIndex = 0;
    this.spawnTimer = 0;
    this.freezeTimer = 0;
    this.fortressSteelTimer = 0;
    this.fortressWasSteel = false;
    this.pendingRespawnTimer = 0;
    this.stageClearScore = 0;
    this.bonusCursor = 0;
    this.lastFrame = 0;
    this.currentPlayerSpawn = { x: 8 * this.tileSize, y: 24 * this.tileSize };

    this.base = new Base(12 * this.tileSize, 24 * this.tileSize, 32);
    this.player = new PlayerTank(this.currentPlayerSpawn);
    this.enemies = [];
    this.bullets = [];
    this.bonuses = [];
    this.effects = [];
    this.spawnQueue = [];
    this.map = Array.from({ length: 26 }, () => Array.from({ length: 26 }, () => ({ type: "empty" })));
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop(time) {
    if (!this.lastFrame) {
      this.lastFrame = time;
    }
    const deltaSeconds = Math.min(0.033, (time - this.lastFrame) / 1000);
    this.lastFrame = time;

    this.update(deltaSeconds);
    this.render();
    requestAnimationFrame(this.loop);
  }

  update(deltaSeconds) {
    this.updateOverlay();

    if (this.input.consumePressed("Enter")) {
      this.audio.ensureContext();
      if (this.scene === "title" || this.scene === "gameOver" || this.scene === "victory") {
        this.beginCampaign();
      }
    }

    if (this.input.consumePressed("KeyP")) {
      if (this.scene === "playing") {
        this.scene = "paused";
      } else if (this.scene === "paused") {
        this.scene = "playing";
      }
    }

    if (this.scene === "title" || this.scene === "paused" || this.scene === "gameOver" || this.scene === "victory") {
      this.updateEffects(deltaSeconds);
      return;
    }

    this.stageTimer += deltaSeconds;
    this.updateEffects(deltaSeconds);

    if (this.scene === "stageIntro") {
      if (this.stageTimer >= 1.2) {
        this.scene = "playing";
        this.stageTimer = 0;
      }
      return;
    }

    if (this.scene === "stageClear") {
      if (this.stageTimer >= 2.4) {
        if (this.stage >= 50) {
          this.scene = "victory";
          this.audio.play("stageClear");
        } else {
          this.loadStage(this.stage + 1);
        }
      }
      return;
    }

    this.updatePlaying(deltaSeconds);
  }

  beginCampaign() {
    this.resetRuntime();
    this.player = new PlayerTank({ x: 8 * this.tileSize, y: 24 * this.tileSize });
    this.player.lives = 3;
    this.player.score = 0;
    this.player.level = 0;
    this.loadStage(1, true);
  }

  loadStage(stageNumber, resetLevel = false) {
    const stage = this.loader.load(stageNumber);
    this.stage = stage.id;
    this.scene = "stageIntro";
    this.stageTimer = 0;
    this.spawnTimer = 0.4;
    this.spawnIndex = 0;
    this.freezeTimer = 0;
    this.fortressSteelTimer = 0;
    this.fortressWasSteel = false;
    this.pendingRespawnTimer = 0;
    this.stageClearScore = 0;
    this.base = new Base(stage.base.x, stage.base.y, 32);
    this.base.reset();
    this.map = stage.tiles;
    this.loader.applyFortress(this.map, false);
    this.wave = stage.wave;
    this.spawnQueue = [...stage.wave.enemies];
    this.enemies = [];
    this.bullets = [];
    this.bonuses = [];
    this.effects = [];
    this.currentPlayerSpawn = stage.playerSpawn;
    if (resetLevel) {
      this.player.spawn(stage.playerSpawn, false);
    } else {
      this.player.spawn(stage.playerSpawn, true);
    }
    this.audio.play("stageStart");
  }

  updatePlaying(deltaSeconds) {
    this.freezeTimer = Math.max(0, this.freezeTimer - deltaSeconds);
    this.fortressSteelTimer = Math.max(0, this.fortressSteelTimer - deltaSeconds);
    if (this.fortressWasSteel && this.fortressSteelTimer <= 0) {
      this.loader.applyFortress(this.map, false);
      this.fortressWasSteel = false;
    }

    this.handlePlayer(deltaSeconds);
    this.spawnEnemies(deltaSeconds);
    this.handleEnemies(deltaSeconds);
    this.handleBullets(deltaSeconds);
    this.handleBonuses(deltaSeconds);

    if (this.player.dead) {
      this.pendingRespawnTimer -= deltaSeconds;
      if (this.pendingRespawnTimer <= 0) {
        if (this.player.lives < 0 || this.base.destroyed) {
          this.scene = "gameOver";
          this.stageTimer = 0;
          this.audio.play("gameOver");
        } else {
          this.player.spawn(this.currentPlayerSpawn, true);
          this.audio.play("spawn");
        }
      }
    }

    const stageDone = this.spawnQueue.length === 0 && this.enemies.every((enemy) => enemy.dead);
    if (stageDone && this.scene === "playing") {
      this.scene = "stageClear";
      this.stageTimer = 0;
      this.stageClearScore = 500 + this.player.level * 200 + this.player.lives * 100;
      this.player.score += this.stageClearScore;
      this.audio.play("stageClear");
    }

    if (this.base.destroyed && this.scene === "playing") {
      this.scene = "gameOver";
      this.stageTimer = 0;
      this.audio.play("gameOver");
    }
  }

  handlePlayer(deltaSeconds) {
    if (this.player.dead) {
      return;
    }

    const direction = this.input.getMovement();
    this.player.update(
      deltaSeconds,
      direction,
      (tank, dx, dy) => this.collision.moveTank(tank, dx, dy, this.map, this.enemies),
      (x, y) => this.collision.getTileAtPixel(this.map, x, y).tile
    );

    if (this.input.isFiring()) {
      const payload = this.player.createBullet();
      if (payload) {
        this.bullets.push(new Bullet({ ...payload, owner: this.player }));
        this.audio.play("fire");
      }
    }
  }

  spawnEnemies(deltaSeconds) {
    this.spawnTimer -= deltaSeconds;
    if (this.spawnTimer > 0 || this.spawnQueue.length === 0) {
      return;
    }
    if (this.enemies.filter((enemy) => !enemy.dead).length >= 4) {
      return;
    }

    const stage = this.loader.load(this.stage);
    const spawnPoint = stage.enemySpawns[this.spawnIndex % stage.enemySpawns.length];
    this.spawnIndex += 1;
    const occupant = [this.player, ...this.enemies].some((tank) => !tank.dead && this.collision.rectsOverlap(
      { x: spawnPoint.x, y: spawnPoint.y, width: 28, height: 28 },
      tank.getBounds()
    ));

    if (occupant) {
      this.spawnTimer = 0.35;
      return;
    }

    const next = this.spawnQueue.shift();
    this.enemies.push(new EnemyTank({ x: spawnPoint.x, y: spawnPoint.y, enemyType: next.type, bonus: next.bonus }));
    this.spawnTimer = this.wave.spawnInterval;
    this.audio.play("spawn");
  }

  handleEnemies(deltaSeconds) {
    for (const enemy of this.enemies) {
      if (enemy.dead) {
        continue;
      }

      enemy.update(
        deltaSeconds,
        { x: this.player.x, y: this.player.y },
        (tank, dx, dy) => this.collision.moveTank(tank, dx, dy, this.map, [this.player, ...this.enemies]),
        enemy.y < 120
      );

      if (this.freezeTimer > 0) {
        enemy.frozenTimer = this.freezeTimer;
      }

      if (enemy.canFire()) {
        const payload = enemy.createBullet();
        if (payload) {
          this.bullets.push(new Bullet({ ...payload, owner: enemy }));
        }
      }
    }
  }

  handleBullets(deltaSeconds) {
    for (const bullet of this.bullets) {
      if (bullet.dead) {
        continue;
      }
      bullet.update(deltaSeconds);
      this.resolveBulletMapCollision(bullet);
      if (!bullet.dead) {
        this.resolveBulletActorCollision(bullet);
      }
      if (!bullet.dead) {
        this.resolveBulletBaseCollision(bullet);
      }
      if (!bullet.dead && (
        bullet.x < 0 ||
        bullet.x > this.playfieldSize ||
        bullet.y < 0 ||
        bullet.y > this.playfieldSize
      )) {
        bullet.dead = true;
      }
    }

    for (let i = 0; i < this.bullets.length; i += 1) {
      const a = this.bullets[i];
      if (a.dead) {
        continue;
      }
      for (let j = i + 1; j < this.bullets.length; j += 1) {
        const b = this.bullets[j];
        if (b.dead || a.owner === b.owner) {
          continue;
        }
        if (this.collision.rectsOverlap(a.getBounds(), b.getBounds())) {
          a.dead = true;
          b.dead = true;
          this.createEffect(a.x, a.y, "#ffffff", 0.16);
        }
      }
    }

    const before = this.bullets.length;
    this.bullets = this.bullets.filter((bullet) => !bullet.dead);
    if (before !== this.bullets.length) {
      this.player.bulletsInFlight = this.bullets.filter((bullet) => bullet.owner === this.player).length;
    }
  }

  resolveBulletMapCollision(bullet) {
    const hit = this.collision.getTileAtPixel(this.map, bullet.x, bullet.y);
    if (!this.collision.isSolidForBullet(hit.tile)) {
      return;
    }

    const destroyed = this.collision.destroyTile(this.map, hit.tileX, hit.tileY, bullet.power);
    if (destroyed) {
      bullet.dead = true;
      this.createEffect(bullet.x, bullet.y, destroyed === "brick" ? "#e89a35" : "#d7d7d7", 0.18);
      this.audio.play(destroyed === "brick" ? "hitBrick" : "hitSteel");
    }
  }

  resolveBulletActorCollision(bullet) {
    if (bullet.fromPlayer) {
      for (const enemy of this.enemies) {
        if (enemy.dead || enemy.spawnShieldTimer > 0) {
          continue;
        }
        if (this.collision.rectsOverlap(bullet.getBounds(), enemy.getBounds())) {
          bullet.dead = true;
          const destroyed = enemy.damage();
          this.createEffect(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, "#f3d34a", 0.24);
          if (destroyed) {
            this.player.score += enemy.scoreValue;
            if (enemy.bonus) {
              this.spawnBonus(enemy.x, enemy.y);
            }
            this.audio.play("explosion");
          }
          return;
        }
      }
      return;
    }

    if (!this.player.dead && this.collision.rectsOverlap(bullet.getBounds(), this.player.getBounds())) {
      bullet.dead = true;
      if (this.player.hit()) {
        this.pendingRespawnTimer = 1.2;
        this.createEffect(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2, "#d86a56", 0.32);
        this.audio.play("explosion");
      }
    }
  }

  resolveBulletBaseCollision(bullet) {
    if (this.base.destroyed) {
      return;
    }
    if (this.collision.rectsOverlap(bullet.getBounds(), this.base.getBounds())) {
      bullet.dead = true;
      this.base.destroyed = true;
      this.createEffect(this.base.x + 16, this.base.y + 16, "#d86a56", 0.5);
      this.audio.play("explosion");
    }
  }

  spawnBonus(x, y) {
    const type = BONUS_TYPES[this.bonusCursor % BONUS_TYPES.length];
    this.bonusCursor += 1;
    this.bonuses.push({
      type,
      label: type === "helmet" ? "H" : type === "grenade" ? "B" : type === "shovel" ? "S" : type === "clock" ? "C" : type === "tank" ? "1" : "*",
      x: Math.max(24, Math.min(360, x + (Math.random() * 64 - 32))),
      y: Math.max(48, Math.min(320, y + (Math.random() * 64 - 32))),
      timer: 10
    });
  }

  handleBonuses(deltaSeconds) {
    for (const bonus of this.bonuses) {
      bonus.timer -= deltaSeconds;
      if (!this.player.dead && this.collision.rectsOverlap(this.player.getBounds(), {
        x: bonus.x,
        y: bonus.y,
        width: 20,
        height: 20
      })) {
        this.applyBonus(bonus.type);
        bonus.timer = 0;
      }
    }

    this.bonuses = this.bonuses.filter((bonus) => bonus.timer > 0);
  }

  applyBonus(type) {
    this.audio.play(type === "helmet" ? "shield" : "pickup");
    if (type === "star") {
      this.player.upgrade();
      this.player.score += 300;
      return;
    }
    if (type === "helmet") {
      this.player.shieldTimer = Math.max(this.player.shieldTimer, 10);
      return;
    }
    if (type === "grenade") {
      for (const enemy of this.enemies) {
        if (!enemy.dead) {
          enemy.dead = true;
          this.player.score += enemy.scoreValue;
          this.createEffect(enemy.x + enemy.size / 2, enemy.y + enemy.size / 2, "#f25f5c", 0.22);
        }
      }
      return;
    }
    if (type === "shovel") {
      this.fortressSteelTimer = 14;
      this.loader.applyFortress(this.map, true);
      this.fortressWasSteel = true;
      return;
    }
    if (type === "clock") {
      this.freezeTimer = 10;
      return;
    }
    if (type === "tank") {
      this.player.addLife();
    }
  }

  updateEffects(deltaSeconds) {
    for (const effect of this.effects) {
      effect.life -= deltaSeconds;
    }
    this.effects = this.effects.filter((effect) => effect.life > 0);
  }

  createEffect(x, y, color, maxLife) {
    this.effects.push({ x, y, color, life: maxLife, maxLife, radius: 8 });
  }

  updateOverlay() {
    if (!this.overlay) {
      return;
    }
    if (["title", "stageIntro", "stageClear", "gameOver", "victory", "paused"].includes(this.scene)) {
      this.overlay.classList.remove("overlay--hidden");
    } else {
      this.overlay.classList.add("overlay--hidden");
    }
    this.overlay.innerHTML = `
      <div>
        <strong>${this.scene === "title" ? "Battle City 50" : `Scene: ${this.scene}`}</strong><br>
        <span>Enter start, P pause, J / Space fire</span>
      </div>
    `;
  }

  render() {
    this.renderer.render({
      scene: this.scene,
      stage: this.stage,
      map: this.map,
      player: this.player,
      enemies: this.enemies,
      bullets: this.bullets,
      bonuses: this.bonuses,
      effects: this.effects,
      base: this.base,
      fortressSteelTimer: this.fortressSteelTimer,
      freezeTimer: this.freezeTimer,
      enemiesRemaining: this.enemies.filter((enemy) => !enemy.dead).length + this.spawnQueue.length,
      spawnQueue: this.spawnQueue.length,
      stageClearScore: this.stageClearScore
    });
  }
}
