/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useDrag } from '@use-gesture/react';
import { useGameStore } from './store/gameStore';
import { GameScene } from './components/game/GameScene';
import { UI } from './components/UI';
import { useEffect } from 'react';

export default function App() {
  const setLane = useGameStore((state) => state.setLane);
  const status = useGameStore((state) => state.status);
  
  // Handling desktop keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setLane(1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, setLane]);

  // Handling touch drag controls
  const bind = useDrag(({ swipe: [swipeX], direction: [dirX], velocity: [velX] }) => {
    if (status !== 'playing') return;
    
    // Fallback if swipe isn't triggered but there's a strong horizontal drag
    if (swipeX !== 0) {
      setLane(swipeX);
    } else if (velX > 0.5 && Math.abs(dirX) > 0.5) {
      setLane(dirX > 0 ? 1 : -1);
    }
  }, { 
    swipe: { distance: 30, velocity: 0.3 },
    axis: 'x'
  });

  return (
    <div 
      {...bind()} 
      className="w-[100dvw] h-[100dvh] overflow-hidden bg-slate-900 touch-none select-none relative font-sans"
    >
      <GameScene />
      <UI />
    </div>
  );
}

