import { create } from 'zustand';

export type GameStatus = 'menu' | 'playing' | 'gameover' | 'paused';
export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  status: GameStatus;
  score: number;
  bestScores: Record<Difficulty, number>;
  level: number;
  speed: number;
  lane: number;
  distance: number;
  difficulty: Difficulty;
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  setLane: (dir: number) => void;
  setDifficulty: (diff: Difficulty) => void;
  returnToMenu: () => void;
  addLevel: (val: number, isMulti?: boolean) => void;
  updateDistance: (delta: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'menu',
  score: 0,
  bestScores: { easy: 0, medium: 0, hard: 0 },
  level: 1,
  speed: 25,
  lane: -1, // -1 (left), 1 (right)
  distance: 0,
  difficulty: 'medium',
  startGame: () => set({ status: 'playing', score: 0, level: 1, speed: 25, lane: -1, distance: 0 }),
  endGame: () => set({ status: 'gameover' }),
  pauseGame: () => set((state) => (state.status === 'playing' ? { status: 'paused' } : {})),
  resumeGame: () => set((state) => (state.status === 'paused' ? { status: 'playing' } : {})),
  returnToMenu: () => set({ status: 'menu', score: 0, level: 1, speed: 25, distance: 0 }),
  setLane: (dir) => set(() => ({ lane: dir < 0 ? -1 : 1 })),
  setDifficulty: (diff) => set(() => ({ difficulty: diff })),
  addLevel: (val, isMulti = false) => set((state) => {
    if (state.status !== 'playing') return {};

    let newLevel = state.level;
    if (isMulti) {
      if (val === 0) {
        newLevel = Math.floor(newLevel / 2);
      } else {
        newLevel *= val;
      }
    } else {
      newLevel += val;
    }
    newLevel = Math.max(0, Math.floor(newLevel));
    
    if (newLevel <= 0) {
      return { level: 0, status: 'gameover' };
    }
    return { level: newLevel };
  }),
  updateDistance: (delta) => set((state) => {
    if (state.status !== 'playing') return {};
    const newDistance = state.distance + (state.speed * delta);
    // Gradually increase speed
    let accel = 0.2;
    if (state.difficulty === 'easy') accel = 0.05;
    if (state.difficulty === 'hard') accel = 0.5;
    
    const newSpeed = Math.min(80, state.speed + (delta * accel));
    const addedScore = Math.floor(newDistance) - Math.floor(state.distance);
    const newScore = state.score + addedScore;
    
    const newBestScores = { ...state.bestScores };
    if (newScore > newBestScores[state.difficulty]) {
        newBestScores[state.difficulty] = newScore;
    }
    
    return { 
        distance: newDistance, 
        speed: newSpeed,
        score: newScore,
        bestScores: newBestScores
    };
  })
}));
