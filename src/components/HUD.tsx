import type { GameStats, PowerUpType } from '../types/game';
import './HUD.css';

interface HUDProps {
  stats: GameStats;
  powerUp: PowerUpType | null;
  powerUpTimer: number;
}

export const HUD: React.FC<HUDProps> = ({ stats, powerUp, powerUpTimer }) => {
  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < stats.lives; i++) {
      hearts.push(<span key={i}>❤️</span>);
    }
    return hearts;
  };

  const getPowerUpText = () => {
    if (!powerUp) return null;
    const timeLeft = Math.ceil(powerUpTimer / 60);
    return (
      <div className="power-up-indicator">
        <span className={`power-up-${powerUp}`}>
          {powerUp === 'invincibility' && '⭐ Invincible'}
          {powerUp === 'speed' && '⚡ Speed Boost'}
          {powerUp === 'doubleJump' && '↟ Double Jump'}
          {powerUp === 'fireball' && '🔥 Fireball'}
        </span>
        <span className="power-up-timer">{timeLeft}s</span>
      </div>
    );
  };

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="hud-item">
          <span className="hud-label">Score:</span>
          <span className="hud-value">{stats.score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Level:</span>
          <span className="hud-value">{stats.level}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Time:</span>
          <span className="hud-value">{stats.time}s</span>
        </div>
      </div>
      <div className="hud-bottom">
        <div className="hud-item hearts">{renderHearts()}</div>
        <div className="hud-item">
          <span className="hud-label">🪙</span>
          <span className="hud-value">{stats.coins}</span>
        </div>
      </div>
      {getPowerUpText()}
    </div>
  );
};
