import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameState, GameStats, GameConfig } from '../types/game';
import { levels } from '../game/levels';
import { HUD } from './HUD';
import { Pause } from './Pause';
import { GameOver } from './GameOver';
import { initAudio } from '../utils/sound';
import './Game.css';

interface GameProps {
  config: GameConfig;
  levelId: number;
  onQuit: () => void;
}

export const Game: React.FC<GameProps> = ({ config, levelId, onQuit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lives: 3,
    coins: 0,
    level: levelId,
    time: 0,
    highScore: parseInt(localStorage.getItem('halloweenHighScore') || '0'),
  });
  const [powerUp] = useState<any>(null);
  const [powerUpTimer] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize audio
    initAudio();

    // Get the level
    const level = levels.find((l) => l.id === levelId) || levels[0];

    // Create game engine
    const engine = new GameEngine(
      canvasRef.current,
      level,
      config,
      (state) => setGameState(state),
      (newStats) => setStats(newStats)
    );

    gameEngineRef.current = engine;
    engine.start();

    // Update power-up state
    const interval = setInterval(() => {
      if (gameEngineRef.current) {
        const stats = gameEngineRef.current.getStats();
        setStats(stats);
      }
    }, 100);

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, [config, levelId]);

  const handleResume = () => {
    gameEngineRef.current?.resume();
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="game-wrapper">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="game-canvas"
      />

      <HUD stats={stats} powerUp={powerUp} powerUpTimer={powerUpTimer} />

      {gameState === 'paused' && <Pause onResume={handleResume} onQuit={onQuit} />}

      {(gameState === 'gameOver' || gameState === 'levelComplete') && (
        <GameOver
          stats={stats}
          isVictory={gameState === 'levelComplete'}
          onRestart={handleRestart}
          onMenu={onQuit}
        />
      )}
    </div>
  );
};
