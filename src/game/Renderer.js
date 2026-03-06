import { BONUS_COLORS, PALETTE, TANK_COLORS } from "../assets/sprites.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.playfieldSize = 416;
    this.panelX = 432;
    this.panelWidth = 160;
  }

  render(frame) {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackdrop();
    this.drawTiles(frame.map, false);
    this.drawBonuses(frame.bonuses ?? []);
    this.drawBase(frame.base, frame.fortressSteelTimer > 0);
    this.drawTanks(frame.enemies ?? [], frame.player);
    this.drawBullets(frame.bullets ?? []);
    this.drawTiles(frame.map, true);
    this.drawEffects(frame.effects ?? []);
    this.drawPanel(frame);
    this.drawSceneBanner(frame);
  }

  drawBackdrop() {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = PALETTE.battlefield;
    ctx.fillRect(0, 0, this.playfieldSize, this.playfieldSize);

    ctx.fillStyle = PALETTE.panel;
    ctx.fillRect(this.panelX, 16, this.panelWidth, 400);
    ctx.fillStyle = PALETTE.panelShadow;
    ctx.fillRect(this.panelX + 8, 24, this.panelWidth - 16, 384);
  }

  drawTiles(map, forestOnly = false) {
    const { ctx } = this;
    const tileSize = 16;
    for (let y = 0; y < map.length; y += 1) {
      for (let x = 0; x < map[y].length; x += 1) {
        const tile = map[y][x];
        const px = x * tileSize;
        const py = y * tileSize;
        if (tile.type === "empty") {
          continue;
        }
        if (forestOnly && tile.type !== "forest") {
          continue;
        }
        if (!forestOnly && tile.type === "forest") {
          continue;
        }
        if (tile.type === "brick") {
          ctx.fillStyle = PALETTE.brickDark;
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = PALETTE.brickLight;
          ctx.fillRect(px + 1, py + 2, 6, 4);
          ctx.fillRect(px + 9, py + 2, 6, 4);
          ctx.fillRect(px + 4, py + 9, 6, 4);
          ctx.fillRect(px + 12, py + 9, 3, 4);
        } else if (tile.type === "steel") {
          ctx.fillStyle = PALETTE.steelDark;
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = PALETTE.steelLight;
          ctx.fillRect(px + 2, py + 2, 5, 5);
          ctx.fillRect(px + 9, py + 2, 5, 5);
          ctx.fillRect(px + 2, py + 9, 5, 5);
          ctx.fillRect(px + 9, py + 9, 5, 5);
        } else if (tile.type === "water") {
          ctx.fillStyle = (x + y) % 2 === 0 ? PALETTE.waterA : PALETTE.waterB;
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(px, py + 4, tileSize, 2);
        } else if (tile.type === "ice") {
          ctx.fillStyle = (x + y) % 2 === 0 ? PALETTE.iceA : PALETTE.iceB;
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fillRect(px + 2, py + 2, 10, 2);
          ctx.fillRect(px + 5, py + 9, 8, 2);
        } else if (tile.type === "forest") {
          ctx.fillStyle = PALETTE.forestB;
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = PALETTE.forestA;
          ctx.fillRect(px + 1, py + 5, 6, 8);
          ctx.fillRect(px + 8, py + 3, 6, 10);
        }
      }
    }
  }

  drawTanks(enemies, player) {
    if (player && !player.dead) {
      this.drawTank(player, TANK_COLORS.player);
      if (player.shieldTimer > 0) {
        this.drawShield(player);
      }
    }

    for (const enemy of enemies) {
      if (enemy.dead) {
        continue;
      }
      const key = enemy.bonus ? "bonus" : enemy.enemyType;
      this.drawTank(enemy, TANK_COLORS[key] ?? TANK_COLORS.basic);
      if (enemy.spawnShieldTimer > 0) {
        this.drawSpawnFlash(enemy);
      }
    }
  }

  drawTank(tank, colors) {
    const { ctx } = this;
    const { x, y, size } = tank;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    if (tank.direction === "right") {
      ctx.rotate(Math.PI / 2);
    } else if (tank.direction === "down") {
      ctx.rotate(Math.PI);
    } else if (tank.direction === "left") {
      ctx.rotate(-Math.PI / 2);
    }

    ctx.fillStyle = colors.trim;
    ctx.fillRect(-12, -14, 8, 24);
    ctx.fillRect(4, -14, 8, 24);
    ctx.fillRect(-10, -6, 20, 16);

    ctx.fillStyle = colors.body;
    ctx.fillRect(-10, -12, 20, 20);
    ctx.fillRect(-4, -18, 8, 8);
    ctx.fillRect(-3, -23, 6, 10);

    ctx.fillStyle = colors.trim;
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }

  drawShield(tank) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = "rgba(96,196,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tank.x + tank.size / 2, tank.y + tank.size / 2, tank.size * 0.74, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawSpawnFlash(tank) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tank.x + tank.size / 2, tank.y + tank.size / 2, tank.size * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawBullets(bullets) {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.white;
    for (const bullet of bullets) {
      if (bullet.dead) {
        continue;
      }
      ctx.fillRect(bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2);
    }
  }

  drawBase(base, steelActive) {
    const { ctx } = this;
    const x = base.x;
    const y = base.y;
    ctx.fillStyle = steelActive ? PALETTE.steelLight : PALETTE.base;
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = steelActive ? PALETTE.steelDark : PALETTE.baseShadow;
    ctx.fillRect(x + 4, y + 6, 24, 18);
    ctx.fillStyle = PALETTE.yellow;
    ctx.fillRect(x + 13, y + 9, 6, 10);
    if (base.destroyed) {
      ctx.fillStyle = PALETTE.red;
      ctx.fillRect(x + 6, y + 6, 20, 20);
    }
  }

  drawBonuses(bonuses) {
    const { ctx } = this;
    for (const bonus of bonuses) {
      const color = BONUS_COLORS[bonus.type] ?? PALETTE.yellow;
      ctx.fillStyle = color;
      ctx.fillRect(bonus.x, bonus.y, 20, 20);
      ctx.fillStyle = PALETTE.black;
      ctx.font = "bold 12px Consolas";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(bonus.label, bonus.x + 10, bonus.y + 10);
    }
  }

  drawEffects(effects) {
    const { ctx } = this;
    for (const effect of effects) {
      const alpha = Math.max(0, effect.life / effect.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * (2 - alpha), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawPanel(frame) {
    const { ctx } = this;
    const x = this.panelX + 20;
    let y = 48;

    ctx.fillStyle = PALETTE.text;
    ctx.font = "bold 18px Consolas";
    ctx.textAlign = "left";
    ctx.fillText("HI-SCORE", x, y);

    y += 28;
    ctx.fillStyle = PALETTE.orange;
    ctx.fillText(String(frame.player.score).padStart(6, "0"), x, y);

    y += 40;
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(`STAGE ${String(frame.stage).padStart(2, "0")}`, x, y);

    y += 34;
    ctx.fillText(`LIVES ${Math.max(0, frame.player.lives)}`, x, y);

    y += 34;
    ctx.fillText(`LEVEL ${frame.player.level + 1}`, x, y);

    y += 34;
    ctx.fillText(`LEFT ${frame.enemiesRemaining}`, x, y);

    y += 34;
    ctx.fillText(`NEXT ${frame.spawnQueue}`, x, y);

    y += 50;
    ctx.fillStyle = frame.freezeTimer > 0 ? PALETTE.green : PALETTE.text;
    ctx.fillText(frame.freezeTimer > 0 ? "CLOCK ON" : "CLOCK OFF", x, y);

    y += 32;
    ctx.fillStyle = frame.fortressSteelTimer > 0 ? PALETTE.steelLight : PALETTE.text;
    ctx.fillText(frame.fortressSteelTimer > 0 ? "BASE IRON" : "BASE BRICK", x, y);

    y += 56;
    ctx.fillStyle = "#8d8d8d";
    ctx.font = "14px Consolas";
    ctx.fillText("ENTER START", x, y);
    ctx.fillText("P PAUSE", x, y + 22);
  }

  drawSceneBanner(frame) {
    const { ctx } = this;
    if (!["title", "stageIntro", "stageClear", "gameOver", "victory", "paused"].includes(frame.scene)) {
      return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(40, 150, 336, 110);
    ctx.strokeStyle = PALETTE.text;
    ctx.strokeRect(40, 150, 336, 110);
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.orange;
    ctx.font = "bold 28px Consolas";

    if (frame.scene === "title") {
      ctx.fillText("BATTLE CITY 50", 208, 185);
      ctx.font = "16px Consolas";
      ctx.fillStyle = PALETTE.text;
      ctx.fillText("PRESS ENTER TO START", 208, 215);
      ctx.fillText("SURVIVE ALL 50 STAGES", 208, 240);
    } else if (frame.scene === "stageIntro") {
      ctx.fillText(`STAGE ${String(frame.stage).padStart(2, "0")}`, 208, 212);
    } else if (frame.scene === "stageClear") {
      ctx.fillText("STAGE CLEAR", 208, 195);
      ctx.font = "16px Consolas";
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(`BONUS ${frame.stageClearScore}`, 208, 225);
    } else if (frame.scene === "gameOver") {
      ctx.fillStyle = PALETTE.red;
      ctx.fillText("GAME OVER", 208, 205);
    } else if (frame.scene === "victory") {
      ctx.fillText("MISSION COMPLETE", 208, 195);
      ctx.font = "16px Consolas";
      ctx.fillStyle = PALETTE.text;
      ctx.fillText("ALL 50 STAGES CLEARED", 208, 225);
    } else if (frame.scene === "paused") {
      ctx.fillText("PAUSED", 208, 205);
    }

    ctx.restore();
  }
}
