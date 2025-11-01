let audioContext: AudioContext | null = null;

export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playSound = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.1
) => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const sounds = {
  jump: () => playSound(400, 0.1, 'square'),
  collect: () => {
    playSound(600, 0.1, 'sine');
    setTimeout(() => playSound(800, 0.1, 'sine'), 50);
  },
  damage: () => playSound(200, 0.3, 'sawtooth'),
  powerUp: () => {
    playSound(523, 0.1, 'sine');
    setTimeout(() => playSound(659, 0.1, 'sine'), 100);
    setTimeout(() => playSound(784, 0.1, 'sine'), 200);
  },
  enemyDefeat: () => playSound(300, 0.2, 'square', 0.15),
  gameOver: () => {
    playSound(300, 0.2, 'sawtooth');
    setTimeout(() => playSound(250, 0.2, 'sawtooth'), 200);
    setTimeout(() => playSound(200, 0.4, 'sawtooth'), 400);
  },
  levelComplete: () => {
    playSound(523, 0.15, 'sine');
    setTimeout(() => playSound(659, 0.15, 'sine'), 150);
    setTimeout(() => playSound(784, 0.15, 'sine'), 300);
    setTimeout(() => playSound(1047, 0.3, 'sine'), 450);
  },
};
