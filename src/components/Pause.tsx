import './Pause.css';

interface PauseProps {
  onResume: () => void;
  onQuit: () => void;
}

export const Pause: React.FC<PauseProps> = ({ onResume, onQuit }) => {
  return (
    <div className="pause-overlay">
      <div className="pause-container">
        <h1 className="pause-title">PAUSED</h1>
        <div className="pause-subtitle">Take a breather...</div>

        <div className="pause-buttons">
          <button className="btn btn-primary btn-large" onClick={onResume}>
            Resume
          </button>
          <button className="btn btn-secondary" onClick={onQuit}>
            Quit to Menu
          </button>
        </div>

        <div className="pause-hint">Press ESC to resume</div>
      </div>
    </div>
  );
};
