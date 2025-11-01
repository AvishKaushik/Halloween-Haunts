import type { Controls, Difficulty } from '../types/game';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SIZE = { width: 32, height: 48 };
export const PLAYER_SPEED = 3;
export const PLAYER_JUMP_POWER = 14;
export const GRAVITY = 0.4;

export const DEFAULT_CONTROLS: Controls = {
  left: 'ArrowLeft',
  right: 'ArrowRight',
  jump: 'Space',
  duck: 'ArrowDown',
  action: 'KeyX',
  pause: 'Escape',
};

export const DIFFICULTY_SETTINGS: Record<Difficulty, {
  enemySpeed: number;
  enemyCount: number;
  playerLives: number;
  scoreMultiplier: number;
}> = {
  easy: {
    enemySpeed: 0.6,
    enemyCount: 0.7,
    playerLives: 5,
    scoreMultiplier: 1,
  },
  normal: {
    enemySpeed: 0.9,
    enemyCount: 1,
    playerLives: 3,
    scoreMultiplier: 1.5,
  },
  hard: {
    enemySpeed: 1.2,
    enemyCount: 1.3,
    playerLives: 1,
    scoreMultiplier: 2,
  },
};

export const COLORS = {
  primary: '#ff6600',
  secondary: '#9933ff',
  background: '#1a0033',
  ghost: '#ffffff',
  pumpkin: '#ff6600',
  skeleton: '#eeeeee',
  bat: '#330033',
  witch: '#663399',
  zombie: '#669966',
};

export const SCORE_VALUES = {
  coin: 10,
  pumpkin: 50,
  candy: 25,
  enemyDefeat: 100,
  levelComplete: 1000,
};

export const POWER_UP_DURATION = 10000; // 10 seconds in milliseconds
export const INVINCIBILITY_DURATION = 120; // 2 seconds in frames (60fps)
