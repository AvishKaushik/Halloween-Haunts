import type { GameStats } from '../types/game';
import './GameOver.css';

interface GameOverProps {
  stats: GameStats;
  isVictory: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ stats, isVictory, onRestart, onMenu }) => {
  return (
    <div className="gameover-overlay">
      <div className="gameover-container">
        {isVictory ? (
          <>
            <h1 className="gameover-title victory">LEVEL COMPLETE!</h1>
            <div className="gameover-subtitle">Spooktacular!</div>
          </>
        ) : (
          <>
            <h1 className="gameover-title defeat">GAME OVER</h1>
            <div className="gameover-subtitle">The spirits got you...</div>
          </>
        )}

        <div className="stats-container">
          <div className="stat-row">
            <span className="stat-label">Final Score:</span>
            <span className="stat-value">{stats.score}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Coins Collected:</span>
            <span className="stat-value">{stats.coins}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{stats.time}s</span>
          </div>
          {stats.score > stats.highScore && (
            <div className="new-high-score">
              NEW HIGH SCORE!
            </div>
          )}
          {stats.highScore > 0 && stats.score <= stats.highScore && (
            <div className="stat-row">
              <span className="stat-label">High Score:</span>
              <span className="stat-value">{stats.highScore}</span>
            </div>
          )}
        </div>

        <div className="gameover-buttons">
          <button className="btn btn-primary btn-large" onClick={onRestart}>
            Play Again
          </button>
          <button className="btn btn-secondary" onClick={onMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
