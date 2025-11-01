export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject extends Position, Size {
  velocityX: number;
  velocityY: number;
}

export interface Player extends GameObject {
  onGround: boolean;
  direction: number; // 1 = right, -1 = left
  invincible: boolean;
  invincibleTimer: number;
  lives: number;
  coins: number;
  powerUpType: PowerUpType | null;
  powerUpTimer: number;
  isJumping: boolean;
  isDucking: boolean;
  animationFrame: number;
}

export interface Enemy extends GameObject {
  type: EnemyType;
  startX: number;
  patrolDistance: number;
  speed: number;
  direction: number;
  health: number;
  isDead: boolean;
}

export interface Platform extends Position, Size {
  type: 'ground' | 'floating' | 'breakable';
  broken: boolean;
}

export interface Collectible extends Position, Size {
  type: CollectibleType;
  collected: boolean;
  value: number;
  bobOffset: number;
}

export interface PowerUp extends Position, Size {
  type: PowerUpType;
  collected: boolean;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type?: 'normal' | 'fog' | 'ember';
}

export interface FogParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  opacity: number;
  lifeTime: number;
}

export type EnemyType = 'ghost' | 'bat' | 'skeleton' | 'witch' | 'zombie';
export type CollectibleType = 'coin' | 'pumpkin' | 'candy';
export type PowerUpType = 'invincibility' | 'speed' | 'doubleJump' | 'fireball';
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameConfig {
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
  playerName: string;
}

export interface Level {
  id: number;
  name: string;
  platforms: Platform[];
  enemies: Enemy[];
  collectibles: Collectible[];
  powerUps: PowerUp[];
  backgroundColor: string;
  gravity: number;
  timeLimit?: number;
  finishX: number; // X position where the level ends
}

export interface GameStats {
  score: number;
  lives: number;
  coins: number;
  level: number;
  time: number;
  highScore: number;
}

export interface Controls {
  left: string;
  right: string;
  jump: string;
  duck: string;
  action: string;
  pause: string;
}
