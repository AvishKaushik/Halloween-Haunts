import { useState } from 'react';
import { Menu } from './components/Menu';
import { Game } from './components/Game';
import type { GameConfig } from './types/game';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [config, setConfig] = useState<GameConfig>({
    difficulty: 'normal',
    soundEnabled: true,
    musicEnabled: true,
    playerName: '',
  });
  const [selectedLevel, setSelectedLevel] = useState(1);

  const handleStart = (gameConfig: GameConfig, levelId: number) => {
    setConfig(gameConfig);
    setSelectedLevel(levelId);
    setGameStarted(true);
  };

  const handleQuit = () => {
    setGameStarted(false);
  };

  const highScore = parseInt(localStorage.getItem('halloweenHighScore') || '0');

  return (
    <div className="app">
      {!gameStarted ? (
        <Menu onStart={handleStart} highScore={highScore} />
      ) : (
        <Game config={config} levelId={selectedLevel} onQuit={handleQuit} />
      )}
    </div>
  );
}

export default App;
