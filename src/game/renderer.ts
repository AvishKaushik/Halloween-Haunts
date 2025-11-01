import type { Player, Enemy, Platform, Collectible, PowerUp, Particle, FogParticle } from '../types/game';
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

  drawFog(fog: FogParticle) {
    const ctx = this.ctx;
    const screenX = fog.x - this.scrollOffset;

    ctx.save();
    ctx.globalAlpha = fog.opacity;
    ctx.fillStyle = '#9999aa';

    // Create gradient for fog
    const gradient = ctx.createRadialGradient(screenX, fog.y, 0, screenX, fog.y, fog.size);
    gradient.addColorStop(0, 'rgba(150, 150, 170, 0.4)');
    gradient.addColorStop(0.5, 'rgba(150, 150, 170, 0.2)');
    gradient.addColorStop(1, 'rgba(150, 150, 170, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(screenX - fog.size, fog.y - fog.size, fog.size * 2, fog.size * 2);
    ctx.restore();
  }

  drawVignette(width: number, height: number) {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.3,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.8
    );

    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  drawHauntedDecorations(groundY: number, scrollOffset: number) {
    // Draw tombstones at intervals
    for (let i = 300; i < 4000; i += 400) {
      this.drawTombstone(i, groundY - 80, scrollOffset);
    }

    // Draw dead trees
    for (let i = 500; i < 4000; i += 600) {
      this.drawDeadTree(i, groundY - 150, scrollOffset);
    }
  }

  private drawTombstone(x: number, y: number, scrollOffset: number) {
    const ctx = this.ctx;
    const screenX = x - scrollOffset;

    if (screenX < -100 || screenX > this.canvasWidth + 100) return;

    ctx.fillStyle = '#555566';
    ctx.strokeStyle = '#333344';
    ctx.lineWidth = 2;

    // Tombstone body
    ctx.beginPath();
    ctx.arc(screenX + 20, y + 10, 15, Math.PI, 0);
    ctx.lineTo(screenX + 35, y + 60);
    ctx.lineTo(screenX + 5, y + 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // RIP text
    ctx.fillStyle = '#222233';
    ctx.font = 'bold 10px serif';
    ctx.textAlign = 'center';
    ctx.fillText('RIP', screenX + 20, y + 30);

    // Cracks
    ctx.strokeStyle = '#444455';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX + 15, y + 35);
    ctx.lineTo(screenX + 18, y + 45);
    ctx.stroke();
  }

  private drawDeadTree(x: number, y: number, scrollOffset: number) {
    const ctx = this.ctx;
    const screenX = x - scrollOffset;

    if (screenX < -100 || screenX > this.canvasWidth + 100) return;

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 4;

    // Trunk
    ctx.beginPath();
    ctx.moveTo(screenX, y + 150);
    ctx.lineTo(screenX, y + 50);
    ctx.stroke();

    // Branches
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX, y + 70);
    ctx.lineTo(screenX - 20, y + 40);
    ctx.moveTo(screenX, y + 80);
    ctx.lineTo(screenX + 15, y + 50);
    ctx.moveTo(screenX, y + 100);
    ctx.lineTo(screenX - 15, y + 70);
    ctx.stroke();
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

    // Evil glowing eyes
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x + 10, y + 12, 3, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 12, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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

    // Glowing eyes
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffff00';
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(x + width / 2 - 3, y + height / 2, 2, 0, Math.PI * 2);
    ctx.arc(x + width / 2 + 3, y + height / 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private drawSkeleton(x: number, y: number, width: number, height: number) {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.skeleton;

    // Skull
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 3, width / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 7, y + 20, 20, 15);

    // Eye sockets with glowing red eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
    ctx.arc(x + 23, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // Glowing red eyes in sockets
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 2, 0, Math.PI * 2);
    ctx.arc(x + 23, y + 12, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Nose
    ctx.fillStyle = '#000000';
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

    // Glowing green eyes
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff00';
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(x + width / 2 - 4, y + 22, 2, 0, Math.PI * 2);
    ctx.arc(x + width / 2 + 4, y + 22, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

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

    // Eyes (misaligned) with eerie white glow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 11, y + 10, 5, 6);
    ctx.fillRect(x + 20, y + 12, 5, 6);

    // Pupils with red glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff6666';
    ctx.fillStyle = '#660000';
    ctx.fillRect(x + 13, y + 12, 2, 3);
    ctx.fillRect(x + 22, y + 14, 2, 3);
    ctx.shadowBlur = 0;

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

    // Platform base - darker, more ominous
    ctx.fillStyle = platform.type === 'breakable' ? '#553322' : '#442200';
    ctx.fillRect(screenX, platform.y, platform.width, platform.height);

    // Dead grass/moss on top - darker green
    ctx.fillStyle = platform.type === 'ground' ? '#224411' : '#335522';
    ctx.fillRect(screenX, platform.y - 5, platform.width, 5);

    // Spooky details
    if (platform.type === 'breakable') {
      ctx.strokeStyle = '#331100';
      ctx.lineWidth = 2;
      for (let i = 20; i < platform.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(screenX + i, platform.y);
        ctx.lineTo(screenX + i, platform.y + platform.height);
        ctx.stroke();
      }
      // Cracks
      ctx.strokeStyle = '#221100';
      ctx.lineWidth = 1;
      for (let i = 10; i < platform.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(screenX + i, platform.y + 5);
        ctx.lineTo(screenX + i + 10, platform.y + 15);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#331100';
      for (let i = 0; i < platform.width; i += 20) {
        ctx.fillRect(screenX + i, platform.y + 5, 2, 15);
      }
    }

    // Add eerie glow from below (ground only)
    if (platform.type === 'ground') {
      const gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
      gradient.addColorStop(0, 'rgba(102, 34, 0, 0)');
      gradient.addColorStop(1, 'rgba(51, 17, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(screenX, platform.y, platform.width, platform.height);
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

    // Different rendering for ember particles
    if (particle.type === 'ember') {
      // Glowing embers
      ctx.shadowBlur = 15;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(screenX, particle.y, particle.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillRect(screenX - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    }

    ctx.globalAlpha = 1;
  }

  drawBackground(backgroundColor: string, canvasWidth: number, canvasHeight: number, lightningFlash: boolean = false) {
    const ctx = this.ctx;

    if (lightningFlash) {
      // Lightning flash - brighten everything
      ctx.fillStyle = '#4d4d66';
    } else {
      // Darker, more ominous background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#0d001a');
      gradient.addColorStop(0.5, backgroundColor);
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
    }

    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add stars that twinkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5) % canvasWidth;
      const y = (i * 73.2) % (canvasHeight / 2);
      const brightness = Math.sin(Date.now() / 500 + i) * 0.3 + 0.7;
      ctx.globalAlpha = brightness;
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
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

  drawMoon(lightningFlash: boolean = false) {
    const ctx = this.ctx;

    // Blood moon effect
    const moonColor = lightningFlash ? '#ffff99' : '#ff6644';
    const glowColor = lightningFlash ? '#ffff99' : '#ff3322';

    ctx.fillStyle = moonColor;
    ctx.shadowBlur = 40;
    ctx.shadowColor = glowColor;

    // Position moon relative to canvas size (right side, upper area)
    const moonX = this.canvasWidth * 0.85;
    const moonY = this.canvasHeight * 0.15;
    const moonRadius = Math.min(this.canvasWidth, this.canvasHeight) * 0.05;

    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Add eerie glow ring
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius + 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}
