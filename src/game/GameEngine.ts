import type {
  Player,
  Enemy,
  Platform,
  Collectible,
  PowerUp,
  Particle,
  FogParticle,
  GameState,
  GameStats,
  GameConfig,
  Level,
} from '../types/game';
import { checkCollision, checkPlatformCollision, isOnGround } from '../utils/collision';
import { Renderer } from './renderer';
import { sounds } from '../utils/sound';
import {
  PLAYER_SIZE,
  PLAYER_SPEED,
  PLAYER_JUMP_POWER,
  GRAVITY,
  CANVAS_WIDTH,
  SCORE_VALUES,
  INVINCIBILITY_DURATION,
  DIFFICULTY_SETTINGS,
} from '../utils/constants';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;

  private player: Player;
  private currentLevel: Level;
  private scrollOffset: number = 0;
  private particles: Particle[] = [];
  private fogParticles: FogParticle[] = [];

  private keys: Record<string, boolean> = {};
  private gameState: GameState = 'menu';
  private stats: GameStats;
  private config: GameConfig;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private elapsedTime: number = 0;

  // Spooky atmospheric effects
  private screenShake: { x: number; y: number; intensity: number } = { x: 0, y: 0, intensity: 0 };
  private lightningTimer: number = 0;
  private lightningFlash: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    level: Level,
    config: GameConfig,
    onStateChange: (state: GameState) => void,
    onStatsChange: (stats: GameStats) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new Renderer(this.ctx);
    this.currentLevel = level;
    this.config = config;

    const difficulty = DIFFICULTY_SETTINGS[config.difficulty];

    this.player = {
      x: 100,
      y: 400,
      width: PLAYER_SIZE.width,
      height: PLAYER_SIZE.height,
      velocityX: 0,
      velocityY: 0,
      onGround: false,
      direction: 1,
      invincible: false,
      invincibleTimer: 0,
      lives: difficulty.playerLives,
      coins: 0,
      powerUpType: null,
      powerUpTimer: 0,
      isJumping: false,
      isDucking: false,
      animationFrame: 0,
    };

    this.stats = {
      score: 0,
      lives: this.player.lives,
      coins: 0,
      level: level.id,
      time: 0,
      highScore: parseInt(localStorage.getItem('halloweenHighScore') || '0'),
    };

    this.setupEventListeners();
    this.onStateChange = onStateChange;
    this.onStatsChange = onStatsChange;
  }

  private onStateChange: (state: GameState) => void;
  private onStatsChange: (stats: GameStats) => void;

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'Escape') {
      if (this.gameState === 'playing') {
        this.pause();
      } else if (this.gameState === 'paused') {
        this.resume();
      }
    }

    // Prevent default for game keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  start() {
    this.gameState = 'playing';
    this.onStateChange(this.gameState);
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  pause() {
    this.gameState = 'paused';
    this.onStateChange(this.gameState);
  }

  resume() {
    this.gameState = 'playing';
    this.onStateChange(this.gameState);
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private gameLoop = (currentTime: number) => {
    if (this.gameState !== 'playing') return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.elapsedTime += deltaTime;
    this.stats.time = Math.floor(this.elapsedTime / 1000);

    this.update();
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update() {
    this.updatePlayer();
    this.updateEnemies();
    this.updateCollectibles();
    this.updatePowerUps();
    this.updateParticles();
    this.updateFogParticles();
    this.updateAtmosphericEffects();
    this.updateCamera();
    this.checkLevelComplete();
  }

  private updatePlayer() {
    const player = this.player;

    // Horizontal movement
    let speed = PLAYER_SPEED;
    if (player.powerUpType === 'speed') {
      speed *= 1.5;
    }

    if (this.keys['ArrowLeft']) {
      player.velocityX = -speed;
      player.direction = -1;
    } else if (this.keys['ArrowRight']) {
      player.velocityX = speed;
      player.direction = 1;
    } else {
      player.velocityX *= 0.8; // Friction
    }

    // Jump
    if ((this.keys['Space'] || this.keys['ArrowUp']) && player.onGround) {
      player.velocityY = -PLAYER_JUMP_POWER;
      player.onGround = false;
      player.isJumping = true;
      if (this.config.soundEnabled) sounds.jump();
    }

    // Double jump power-up
    if (
      (this.keys['Space'] || this.keys['ArrowUp']) &&
      !player.onGround &&
      player.isJumping &&
      player.powerUpType === 'doubleJump'
    ) {
      player.velocityY = -PLAYER_JUMP_POWER * 0.8;
      player.isJumping = false;
      if (this.config.soundEnabled) sounds.jump();
    }

    // Apply gravity
    player.velocityY += this.currentLevel.gravity || GRAVITY;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Platform collisions
    player.onGround = false;
    this.currentLevel.platforms.forEach((platform) => {
      if (platform.broken) return;

      const collision = checkPlatformCollision(player, {
        ...platform,
        x: platform.x - this.scrollOffset,
      });

      if (collision === 'top') {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.onGround = true;
        player.isJumping = false;

        // Break breakable platforms
        if (platform.type === 'breakable' && player.velocityY > 0) {
          setTimeout(() => {
            platform.broken = true;
          }, 500);
        }
      } else if (collision === 'bottom') {
        player.y = platform.y + platform.height;
        player.velocityY = 0;
      } else if (collision === 'left') {
        player.x = platform.x - this.scrollOffset - player.width;
        player.velocityX = 0;
      } else if (collision === 'right') {
        player.x = platform.x - this.scrollOffset + platform.width;
        player.velocityX = 0;
      }
    });

    // Boundaries
    if (player.x < 0) player.x = 0;

    // Fall off screen
    if (player.y > 650) {
      this.takeDamage();
    }

    // Invincibility timer
    if (player.invincible) {
      player.invincibleTimer--;
      if (player.invincibleTimer <= 0) {
        player.invincible = false;
      }
    }

    // Power-up timer
    if (player.powerUpTimer > 0) {
      player.powerUpTimer--;
      if (player.powerUpTimer <= 0) {
        player.powerUpType = null;
      }
    }
  }

  private updateEnemies() {
    this.currentLevel.enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      // Update position
      enemy.x += enemy.speed * enemy.direction * DIFFICULTY_SETTINGS[this.config.difficulty].enemySpeed;

      // Patrol
      if (enemy.x > enemy.startX + enemy.patrolDistance) {
        enemy.direction = -1;
      } else if (enemy.x < enemy.startX) {
        enemy.direction = 1;
      }

      // Bat flying pattern
      if (enemy.type === 'bat') {
        enemy.y += Math.sin(Date.now() / 200) * 2;
      }

      // Check collision with player
      const enemyScreenPos = { ...enemy, x: enemy.x - this.scrollOffset };
      if (checkCollision(this.player, enemyScreenPos)) {
        // Check if player jumped on enemy
        if (this.player.velocityY > 0 && this.player.y + this.player.height - 10 < enemy.y) {
          this.defeatEnemy(enemy);
          this.player.velocityY = -8; // Bounce
        } else {
          this.takeDamage();
        }
      }
    });
  }

  private updateCollectibles() {
    this.currentLevel.collectibles.forEach((collectible) => {
      if (collectible.collected) return;

      collectible.bobOffset += 0.1;

      const collectibleScreenPos = { ...collectible, x: collectible.x - this.scrollOffset };
      if (checkCollision(this.player, collectibleScreenPos)) {
        collectible.collected = true;
        this.stats.score += collectible.value * DIFFICULTY_SETTINGS[this.config.difficulty].scoreMultiplier;
        this.stats.coins++;
        this.player.coins++;
        this.onStatsChange(this.stats);

        if (this.config.soundEnabled) sounds.collect();

        // Create particles
        for (let i = 0; i < 8; i++) {
          this.createParticle(
            collectible.x - this.scrollOffset + collectible.width / 2,
            collectible.y + collectible.height / 2,
            '#ffcc00'
          );
        }
      }
    });
  }

  private updatePowerUps() {
    this.currentLevel.powerUps.forEach((powerUp) => {
      if (powerUp.collected) return;

      powerUp.bobOffset += 0.1;

      const powerUpScreenPos = { ...powerUp, x: powerUp.x - this.scrollOffset };
      if (checkCollision(this.player, powerUpScreenPos)) {
        powerUp.collected = true;
        this.player.powerUpType = powerUp.type;
        this.player.powerUpTimer = 600; // 10 seconds at 60fps

        if (this.config.soundEnabled) sounds.powerUp();

        // Create particles
        for (let i = 0; i < 12; i++) {
          this.createParticle(
            powerUp.x - this.scrollOffset + powerUp.width / 2,
            powerUp.y + powerUp.height / 2,
            '#ffff00'
          );
        }
      }
    });
  }

  private updateParticles() {
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.2; // Gravity
      particle.life--;
      return particle.life > 0;
    });
  }

  private updateFogParticles() {
    // Create new fog particles periodically
    if (Math.random() < 0.3) {
      this.createFogParticle();
    }

    // Update existing fog particles
    this.fogParticles = this.fogParticles.filter((fog) => {
      fog.x += fog.velocityX;
      fog.y += fog.velocityY;
      fog.lifeTime--;
      fog.opacity = (fog.lifeTime / 300) * 0.3; // Fade out
      return fog.lifeTime > 0;
    });
  }

  private createFogParticle() {
    const fog: FogParticle = {
      x: this.scrollOffset + Math.random() * this.canvas.width,
      y: this.currentLevel.platforms[0].y - 50 - Math.random() * 200,
      velocityX: -0.2 + Math.random() * 0.4,
      velocityY: -0.1 + Math.random() * 0.2,
      size: 50 + Math.random() * 100,
      opacity: 0.1 + Math.random() * 0.2,
      lifeTime: 200 + Math.random() * 100,
    };
    this.fogParticles.push(fog);
  }

  private updateAtmosphericEffects() {
    // Screen shake decay
    if (this.screenShake.intensity > 0) {
      this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity;
      this.screenShake.intensity *= 0.9;
      if (this.screenShake.intensity < 0.1) {
        this.screenShake.intensity = 0;
        this.screenShake.x = 0;
        this.screenShake.y = 0;
      }
    }

    // Random lightning flashes
    this.lightningTimer++;
    if (this.lightningTimer > 300 + Math.random() * 300) {
      this.lightningFlash = true;
      this.lightningTimer = 0;
      setTimeout(() => {
        this.lightningFlash = false;
      }, 100);
    }

    // Create floating embers occasionally
    if (Math.random() < 0.05) {
      this.createEmber();
    }
  }

  private createEmber() {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.5 + 0.5;

    this.particles.push({
      x: this.scrollOffset + Math.random() * this.canvas.width,
      y: this.currentLevel.platforms[0].y - Math.random() * 100,
      velocityX: Math.cos(angle) * speed,
      velocityY: -Math.abs(Math.sin(angle) * speed) - 1,
      life: 60 + Math.random() * 60,
      maxLife: 120,
      color: Math.random() > 0.5 ? '#ff6600' : '#ff3300',
      size: 2 + Math.random() * 3,
      type: 'ember',
    });
  }

  private triggerScreenShake(intensity: number = 10) {
    this.screenShake.intensity = intensity;
  }

  private updateCamera() {
    const centerX = this.canvas.width / 2.5; // Keep player slightly left of center

    // Lock player at centerX and scroll the world instead
    if (this.player.x > centerX) {
      const delta = this.player.x - centerX;
      this.scrollOffset += delta;
      this.player.x = centerX;
    }

    this.renderer.setScrollOffset(this.scrollOffset);
  }

  private takeDamage() {
    if (this.player.invincible || this.player.powerUpType === 'invincibility') return;

    this.player.lives--;
    this.stats.lives = this.player.lives;
    this.onStatsChange(this.stats);

    if (this.config.soundEnabled) sounds.damage();

    // Trigger screen shake on damage
    this.triggerScreenShake(15);

    if (this.player.lives <= 0) {
      this.gameOver();
    } else {
      // Reset position
      this.player.x = 100;
      this.player.y = 400;
      this.player.velocityX = 0;
      this.player.velocityY = 0;
      this.player.invincible = true;
      this.player.invincibleTimer = INVINCIBILITY_DURATION;
      this.scrollOffset = 0;
    }
  }

  private defeatEnemy(enemy: Enemy) {
    enemy.isDead = true;
    this.stats.score += SCORE_VALUES.enemyDefeat * DIFFICULTY_SETTINGS[this.config.difficulty].scoreMultiplier;
    this.onStatsChange(this.stats);

    if (this.config.soundEnabled) sounds.enemyDefeat();

    // Create particles
    for (let i = 0; i < 10; i++) {
      this.createParticle(enemy.x - this.scrollOffset + enemy.width / 2, enemy.y + enemy.height / 2, '#ff0000');
    }
  }

  private createParticle(x: number, y: number, color: string) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 2;

    this.particles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      life: 30,
      maxLife: 30,
      color,
      size: Math.random() * 4 + 2,
    });
  }

  private checkLevelComplete() {
    // Check if player reached the finish line (using real world position, not screen position)
    const playerWorldX = this.player.x + this.scrollOffset;
    const reachedEnd = playerWorldX >= this.currentLevel.finishX;

    if (reachedEnd) {
      this.levelComplete();
    }
  }

  private levelComplete() {
    this.gameState = 'levelComplete';
    this.stats.score += SCORE_VALUES.levelComplete * DIFFICULTY_SETTINGS[this.config.difficulty].scoreMultiplier;
    this.onStatsChange(this.stats);
    this.onStateChange(this.gameState);

    if (this.config.soundEnabled) sounds.levelComplete();

    // Save high score
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('halloweenHighScore', this.stats.score.toString());
    }
  }

  private gameOver() {
    this.gameState = 'gameOver';
    this.onStateChange(this.gameState);

    if (this.config.soundEnabled) sounds.gameOver();

    // Save high score
    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('halloweenHighScore', this.stats.score.toString());
    }
  }

  private render() {
    // Update renderer canvas size in case of window resize
    this.renderer.updateCanvasSize();

    // Apply screen shake
    this.ctx.save();
    this.ctx.translate(this.screenShake.x, this.screenShake.y);

    // Clear canvas
    this.ctx.clearRect(-this.screenShake.x, -this.screenShake.y, this.canvas.width, this.canvas.height);

    // Draw background with lightning effect
    this.renderer.drawBackground(
      this.currentLevel.backgroundColor,
      this.canvas.width,
      this.canvas.height,
      this.lightningFlash
    );
    this.renderer.drawMoon(this.lightningFlash);

    // Draw fog layer (bottom layer)
    this.fogParticles.forEach((fog) => this.renderer.drawFog(fog));

    // Draw finish flag
    this.renderer.drawFinishFlag(this.currentLevel.finishX, this.currentLevel.platforms[0].y);

    // Draw tombstones and decorations
    this.renderer.drawHauntedDecorations(this.currentLevel.platforms[0].y, this.scrollOffset);

    // Draw game objects
    this.currentLevel.platforms.forEach((platform) => this.renderer.drawPlatform(platform));
    this.currentLevel.collectibles.forEach((collectible) => this.renderer.drawCollectible(collectible));
    this.currentLevel.powerUps.forEach((powerUp) => this.renderer.drawPowerUp(powerUp));
    this.currentLevel.enemies.forEach((enemy) => this.renderer.drawEnemy(enemy));
    this.particles.forEach((particle) => this.renderer.drawParticle(particle));

    // Draw player
    this.renderer.drawPlayer(this.player);

    // Draw vignette effect (darkened edges)
    this.renderer.drawVignette(this.canvas.width, this.canvas.height);

    this.ctx.restore();
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getState(): GameState {
    return this.gameState;
  }
}
