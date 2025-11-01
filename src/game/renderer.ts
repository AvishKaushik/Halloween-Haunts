import type { Player, Enemy, Platform, Collectible, PowerUp, Particle } from '../types/game';
import { COLORS } from '../utils/constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private scrollOffset: number = 0;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;
  }

  setScrollOffset(offset: number) {
    this.scrollOffset = offset;
  }

  updateCanvasSize() {
    this.canvasWidth = this.ctx.canvas.width;
    this.canvasHeight = this.ctx.canvas.height;
  }

  drawPlayer(player: Player) {
    const ctx = this.ctx;

    // Flashing effect when invincible
    if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    if (player.powerUpType === 'invincibility') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffff00';
    }

    // Ghost body
    ctx.fillStyle = COLORS.ghost;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 3, player.width / 2, Math.PI, 0);
    ctx.lineTo(player.x + player.width, player.y + player.height);

    // Wavy bottom
    for (let i = 0; i < 3; i++) {
      ctx.lineTo(
        player.x + player.width - i * (player.width / 3) - player.width / 6,
        player.y + player.height - (i % 2 === 0 ? 5 : 0)
      );
    }
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    const eyeOffset = player.direction > 0 ? 3 : -3;
    ctx.beginPath();
    ctx.arc(player.x + 10 + eyeOffset, player.y + 15, 3, 0, Math.PI * 2);
    ctx.arc(player.x + 22 + eyeOffset, player.y + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 25, 4, 0, Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  drawEnemy(enemy: Enemy) {
    if (enemy.isDead) return;

    const ctx = this.ctx;
    const screenX = enemy.x - this.scrollOffset;

    if (screenX + enemy.width < 0 || screenX > this.canvasWidth) return;

    switch (enemy.type) {
      case 'ghost':
        this.drawGhostEnemy(screenX, enemy.y, enemy.width, enemy.height);
        break;
      case 'bat':
        this.drawBat(screenX, enemy.y, enemy.width, enemy.height);
        break;
      case 'skeleton':
        this.drawSkeleton(screenX, enemy.y, enemy.width, enemy.height);
        break;
      case 'witch':
        this.drawWitch(screenX, enemy.y, enemy.width, enemy.height);
        break;
      case 'zombie':
        this.drawZombie(screenX, enemy.y, enemy.width, enemy.height);
        break;
    }
  }

  private drawGhostEnemy(x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ccccff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 3, width / 2, Math.PI, 0);
    ctx.lineTo(x + width, y + height);
    for (let i = 0; i < 3; i++) {
      ctx.lineTo(x + width - i * (width / 3) - width / 6, y + height - (i % 2 === 0 ? 4 : 0));
    }
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Evil eyes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x + 10, y + 12, 3, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBat(x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.bat;

    // Body
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 3, height / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    const wingFlap = Math.sin(Date.now() / 100) * 5;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height / 2);
    ctx.lineTo(x - 5, y + wingFlap);
    ctx.lineTo(x + 5, y + height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height / 2);
    ctx.lineTo(x + width + 5, y + wingFlap);
    ctx.lineTo(x + width - 5, y + height / 2);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x + width / 2 - 3, y + height / 2, 2, 0, Math.PI * 2);
    ctx.arc(x + width / 2 + 3, y + height / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSkeleton(x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.skeleton;

    // Skull
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 3, width / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 7, y + 20, 20, 15);

    // Eye sockets
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
    ctx.arc(x + 23, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(x + 17.5, y + 18);
    ctx.lineTo(x + 15, y + 22);
    ctx.lineTo(x + 20, y + 22);
    ctx.closePath();
    ctx.fill();

    // Teeth
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 9 + i * 5, y + 28, 3, 5);
    }
  }

  private drawWitch(x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;

    // Hat
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width / 2 - 8, y + 12);
    ctx.lineTo(x + width / 2 + 8, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(x + width / 2 - 12, y + 12, 24, 4);

    // Face
    ctx.fillStyle = COLORS.witch;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 24, 10, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(x + width / 2 - 4, y + 22, 2, 0, Math.PI * 2);
    ctx.arc(x + width / 2 + 4, y + 22, 2, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = COLORS.witch;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + 24);
    ctx.lineTo(x + width / 2 - 2, y + 28);
    ctx.lineTo(x + width / 2 + 2, y + 26);
    ctx.closePath();
    ctx.fill();
  }

  private drawZombie(x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;

    // Head
    ctx.fillStyle = COLORS.zombie;
    ctx.fillRect(x + 8, y + 5, 20, 18);

    // Eyes (misaligned)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 11, y + 10, 5, 6);
    ctx.fillRect(x + 20, y + 12, 5, 6);

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 13, y + 12, 2, 3);
    ctx.fillRect(x + 22, y + 14, 2, 3);

    // Mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 20);
    ctx.lineTo(x + 16, y + 22);
    ctx.lineTo(x + 20, y + 20);
    ctx.stroke();

    // Arms (reaching forward)
    ctx.fillStyle = COLORS.zombie;
    ctx.fillRect(x + 5, y + 25, 8, 4);
    ctx.fillRect(x + 23, y + 25, 8, 4);
  }

  drawPlatform(platform: Platform) {
    if (platform.broken) return;

    const ctx = this.ctx;
    const screenX = platform.x - this.scrollOffset;

    if (screenX + platform.width < 0 || screenX > this.canvasWidth) return;

    // Platform base
    ctx.fillStyle = platform.type === 'breakable' ? '#996633' : '#663300';
    ctx.fillRect(screenX, platform.y, platform.width, platform.height);

    // Grass/moss on top
    ctx.fillStyle = platform.type === 'ground' ? '#33cc33' : '#669966';
    ctx.fillRect(screenX, platform.y - 5, platform.width, 5);

    // Details
    if (platform.type === 'breakable') {
      ctx.strokeStyle = '#663300';
      ctx.lineWidth = 2;
      for (let i = 20; i < platform.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(screenX + i, platform.y);
        ctx.lineTo(screenX + i, platform.y + platform.height);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#552200';
      for (let i = 0; i < platform.width; i += 20) {
        ctx.fillRect(screenX + i, platform.y + 5, 2, 15);
      }
    }
  }

  drawCollectible(collectible: Collectible) {
    if (collectible.collected) return;

    const ctx = this.ctx;
    const screenX = collectible.x - this.scrollOffset;

    if (screenX + collectible.width < 0 || screenX > this.canvasWidth) return;

    const bob = Math.sin(collectible.bobOffset) * 5;

    switch (collectible.type) {
      case 'coin':
        this.drawCoin(screenX, collectible.y + bob, collectible.width);
        break;
      case 'pumpkin':
        this.drawPumpkin(screenX, collectible.y + bob, collectible.width);
        break;
      case 'candy':
        this.drawCandy(screenX, collectible.y + bob, collectible.width);
        break;
    }
  }

  private drawCoin(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dollar sign or sparkle
    ctx.fillStyle = '#ff9900';
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x + size / 2, y + size / 2);
  }

  private drawPumpkin(x: number, y: number, size: number) {
    const ctx = this.ctx;

    // Pumpkin body
    ctx.fillStyle = COLORS.pumpkin;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 8);
    ctx.lineTo(x + 12, y + 11);
    ctx.lineTo(x + 8, y + 14);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + size - 8, y + 8);
    ctx.lineTo(x + size - 12, y + 11);
    ctx.lineTo(x + size - 8, y + 14);
    ctx.closePath();
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2 + 3, size / 3, 0, Math.PI);
    ctx.fill();

    // Stem
    ctx.fillStyle = '#336600';
    ctx.fillRect(x + size / 2 - 3, y - 5, 6, 8);
  }

  private drawCandy(x: number, y: number, size: number) {
    const ctx = this.ctx;

    // Wrapper
    ctx.fillStyle = '#ff3366';
    ctx.fillRect(x + 5, y + size / 3, size - 10, size / 2);

    // Candy center
    const stripeWidth = 3;
    for (let i = 0; i < size - 10; i += stripeWidth * 2) {
      ctx.fillStyle = i % (stripeWidth * 4) === 0 ? '#ffffff' : '#ff3366';
      ctx.fillRect(x + 5 + i, y + size / 3, stripeWidth, size / 2);
    }

    // Wrapper ends
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + size / 3);
    ctx.lineTo(x, y + size / 3 - 3);
    ctx.lineTo(x, y + size / 3 + size / 2 + 3);
    ctx.lineTo(x + 5, y + size / 3 + size / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + size - 5, y + size / 3);
    ctx.lineTo(x + size, y + size / 3 - 3);
    ctx.lineTo(x + size, y + size / 3 + size / 2 + 3);
    ctx.lineTo(x + size - 5, y + size / 3 + size / 2);
    ctx.closePath();
    ctx.fill();
  }

  drawPowerUp(powerUp: PowerUp) {
    if (powerUp.collected) return;

    const ctx = this.ctx;
    const screenX = powerUp.x - this.scrollOffset;

    if (screenX + powerUp.width < 0 || screenX > this.canvasWidth) return;

    const bob = Math.sin(powerUp.bobOffset) * 5;

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.getPowerUpColor(powerUp.type);

    // Star container
    ctx.fillStyle = this.getPowerUpColor(powerUp.type);
    this.drawStar(ctx, screenX + powerUp.width / 2, powerUp.y + bob, powerUp.width / 2.5, 5);

    // Icon
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getPowerUpIcon(powerUp.type), screenX + powerUp.width / 2, powerUp.y + bob);
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, points: number) {
    const innerRadius = outerRadius / 2;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = cx + Math.cos(angle - Math.PI / 2) * radius;
      const y = cy + Math.sin(angle - Math.PI / 2) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  private getPowerUpColor(type: PowerUp['type']): string {
    switch (type) {
      case 'invincibility':
        return '#ffff00';
      case 'speed':
        return '#00ffff';
      case 'doubleJump':
        return '#ff00ff';
      case 'fireball':
        return '#ff6600';
    }
  }

  private getPowerUpIcon(type: PowerUp['type']): string {
    switch (type) {
      case 'invincibility':
        return '⭐';
      case 'speed':
        return '⚡';
      case 'doubleJump':
        return '↟';
      case 'fireball':
        return '🔥';
    }
  }

  drawParticle(particle: Particle) {
    const ctx = this.ctx;
    const screenX = particle.x - this.scrollOffset;

    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life / particle.maxLife;
    ctx.fillRect(screenX - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    ctx.globalAlpha = 1;
  }

  drawBackground(backgroundColor: string, canvasWidth: number, canvasHeight: number) {
    const ctx = this.ctx;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  drawFinishFlag(finishX: number, groundY: number) {
    const ctx = this.ctx;
    const screenX = finishX - this.scrollOffset;

    // Flag pole
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(screenX, groundY - 150, 5, 150);

    // Flag
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(screenX + 5, groundY - 150);
    ctx.lineTo(screenX + 60, groundY - 130);
    ctx.lineTo(screenX + 5, groundY - 110);
    ctx.closePath();
    ctx.fill();

    // Checkered pattern
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(screenX + 5 + i * 18, groundY - 150 + j * 20, 18, 20);
        }
      }
    }

    // "FINISH" text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', screenX + 30, groundY - 160);
  }

  drawMoon() {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffff99';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffff99';
    ctx.beginPath();
    // Position moon relative to canvas size (right side, upper area)
    const moonX = this.canvasWidth * 0.85;
    const moonY = this.canvasHeight * 0.15;
    const moonRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.05;
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
