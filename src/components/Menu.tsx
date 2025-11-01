import { useState } from 'react';
import type { GameConfig, Difficulty } from '../types/game';
import './Menu.css';

interface MenuProps {
  onStart: (config: GameConfig, levelId: number) => void;
  highScore: number;
}

export const Menu: React.FC<MenuProps> = ({ onStart, highScore }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [config, setConfig] = useState<GameConfig>({
    difficulty: 'normal',
    soundEnabled: true,
    musicEnabled: true,
    playerName: '',
  });

  const handleStart = (levelId: number = 1) => {
    onStart(config, levelId);
  };

  if (showSettings) {
    return (
      <div className="menu-overlay">
        <div className="menu-container settings-container">
          <h1 className="menu-title">Settings</h1>

          <div className="settings-group">
            <label className="settings-label">Difficulty:</label>
            <div className="button-group">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  className={`btn ${config.difficulty === diff ? 'btn-active' : 'btn-secondary'}`}
                  onClick={() => setConfig({ ...config, difficulty: diff })}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={config.soundEnabled}
                onChange={(e) => setConfig({ ...config, soundEnabled: e.target.checked })}
              />
              Sound Effects
            </label>
          </div>

          <div className="settings-group">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={config.musicEnabled}
                onChange={(e) => setConfig({ ...config, musicEnabled: e.target.checked })}
              />
              Background Music
            </label>
          </div>

          <button className="btn btn-primary" onClick={() => setShowSettings(false)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (showLevelSelect) {
    return (
      <div className="menu-overlay">
        <div className="menu-container">
          <h1 className="menu-title">Select Level</h1>

          <div className="level-grid">
            <div className="level-card" onClick={() => handleStart(1)}>
              <div className="level-number">1</div>
              <h3>Haunted Graveyard</h3>
              <p>Beginner level with ghosts and skeletons</p>
            </div>

            <div className="level-card" onClick={() => handleStart(2)}>
              <div className="level-number">2</div>
              <h3>Spooky Forest</h3>
              <p>Watch out for witches and zombies!</p>
            </div>

            <div className="level-card" onClick={() => handleStart(3)}>
              <div className="level-number">3</div>
              <h3>Witch's Castle</h3>
              <p>The ultimate challenge awaits!</p>
            </div>
          </div>

          <button className="btn btn-secondary" onClick={() => setShowLevelSelect(false)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-overlay">
      <div className="menu-container">
        <h1 className="menu-title spooky-title">
          <span className="title-word">Halloween</span>
          <span className="title-word">Haunts</span>
        </h1>

        <div className="subtitle">A Spooky Platformer Adventure</div>

        {highScore > 0 && (
          <div className="high-score">
            High Score: {highScore}
          </div>
        )}

        <div className="menu-buttons">
          <button className="btn btn-primary btn-large" onClick={() => handleStart(1)}>
            Start Game
          </button>
          <button className="btn btn-secondary" onClick={() => setShowLevelSelect(true)}>
            Select Level
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
            Settings
          </button>
        </div>

        <div className="controls-info">
          <h3>Controls</h3>
          <div className="controls-grid">
            <div><kbd>←</kbd> <kbd>→</kbd> Move</div>
            <div><kbd>Space</kbd> Jump</div>
            <div><kbd>Esc</kbd> Pause</div>
          </div>
        </div>
      </div>
    </div>
  );
};
