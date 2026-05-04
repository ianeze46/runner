import { useGameStore, Difficulty } from '../store/gameStore';

export function UI() {
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const level = useGameStore((state) => state.level);
  const startGame = useGameStore((state) => state.startGame);
  const returnToMenu = useGameStore((state) => state.returnToMenu);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const bestScores = useGameStore((state) => state.bestScores);
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden font-sans">
      
      {/* HUD: Visible only when playing or on game over or paused */}
      {status !== 'menu' && (
        <div className="flex justify-between px-4 pt-6 md:px-12 md:pt-8 pointer-events-none w-full">
          {/* Score Box */}
          <div className="bg-black/80 px-4 py-3 md:px-6 md:py-4 rounded-[15px] md:rounded-[20px] border-[3px] md:border-[4px] border-[#333] shadow-[0_4px_0_#333] md:shadow-[0_6px_0_#333] text-left self-start mt-2 backdrop-blur-sm pointer-events-none">
             <div className="text-[12px] md:text-[14px] uppercase tracking-[2px] md:tracking-[3px] opacity-70 text-white mb-1 md:mb-1.5 font-bold">Score</div>
             <div className="text-[32px] md:text-[40px] leading-[0.8] font-black tracking-[-1px] md:tracking-[-2px] text-white font-sans mb-2 md:mb-3">{score.toLocaleString('en-US', {minimumIntegerDigits: 5, useGrouping: true})}</div>
             <div className="text-[12px] md:text-[14px] uppercase tracking-[1px] md:tracking-[2px] text-[#FFD700] font-bold">Best: {bestScores[difficulty].toLocaleString()}</div>
          </div>
          
          {/* Pause Button */}
          <div className="self-start mt-2">
            {status === 'playing' && (
                <button 
                  onClick={pauseGame}
                  className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-[12px] md:rounded-[15px] border-[3px] md:border-4 border-[#333] shadow-[0_4px_0_#333] flex items-center justify-center pointer-events-auto transform transition active:translate-y-1 active:shadow-none"
                >
                  <div className="flex gap-1 md:gap-1.5">
                    <div className="w-1.5 h-4 md:w-2 md:h-5 bg-[#333] rounded-sm"></div>
                    <div className="w-1.5 h-4 md:w-2 md:h-5 bg-[#333] rounded-sm"></div>
                  </div>
                </button>
            )}
            {/* Placeholder if paused/gameover to keep spacing */}
            {status !== 'playing' && <div className="w-12 h-12 md:w-14 md:h-14"></div>}
          </div>
        </div>
      )}

      {/* Main Menu */}
      {status === 'menu' && (
        <div className="absolute inset-0 bg-transparent flex flex-col justify-center items-center pointer-events-auto">
          <div className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border-[4px] md:border-[5px] border-[#333] shadow-[0_6px_0_#333] md:shadow-[0_8px_0_#333] max-w-md w-full text-center mx-4 flex flex-col max-h-[90dvh]">
            <h1 className="text-3xl md:text-5xl font-black text-[#FF9800] mb-2 md:mb-4 tracking-[-1px] md:tracking-[-2px] uppercase drop-shadow-[0_2px_0_#333] shrink-0">
              LEVEL UP RUNNER
            </h1>
            <div className="overflow-y-auto overflow-x-hidden my-2 md:my-4 px-2">
                <p className="text-[#555] mb-4 md:mb-6 font-bold text-sm md:text-lg">Swipe left and right to switch lanes. Go through gates to increase your level. Don't let your level hit zero!</p>
                
                {/* Difficulty Selector */}
                <div className="flex justify-center flex-wrap gap-2 mb-4 md:mb-6">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-[8px] md:rounded-[10px] font-black uppercase tracking-wider text-xs md:text-sm border-2 transition-transform active:scale-95 ${
                        difficulty === diff 
                          ? 'bg-[#333] text-white border-[#333] shadow-[0_3px_0_#111] md:shadow-[0_4px_0_#111]' 
                          : 'bg-[#eee] text-[#777] border-[#ccc] hover:bg-[#ddd]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
            </div>
            <button 
              onClick={startGame}
              className="w-full bg-[#4CAF50] hover:bg-[#43a047] text-white font-black text-xl md:text-2xl py-3 md:py-4 rounded-[12px] md:rounded-[15px] border-[3px] md:border-[4px] border-[#2E7D32] shadow-[0_4px_0_#2E7D32] md:shadow-[0_6px_0_#2E7D32] uppercase tracking-[1px] md:tracking-[2px] transform transition active:translate-y-2 active:shadow-none shrink-0"
            >
              TAP TO START
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {status === 'gameover' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto animate-in fade-in duration-500">
          <div className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border-[4px] md:border-[5px] border-[#333] shadow-[0_6px_0_#333] md:shadow-[0_8px_0_#333] max-w-sm w-full text-center mx-4 flex flex-col max-h-[90dvh]">
            <div className="overflow-y-auto px-2">
                <h2 className="text-4xl md:text-5xl font-black text-[#F44336] mb-2 tracking-tighter uppercase drop-shadow-[0_2px_0_#333]">GAME OVER</h2>
                <p className="text-[#555] font-bold text-sm md:text-lg mb-6 md:mb-8 uppercase">Your level reached zero.</p>
                
                <div className="bg-[#555] border-4 border-[#333] rounded-[15px] p-3 md:p-4 mb-6 md:mb-8 text-white relative">
                  <div className="text-[12px] md:text-[14px] font-black uppercase tracking-[2px] opacity-80 mb-1">Final Score</div>
                  <div className="font-black text-4xl md:text-5xl tracking-[-1px]">{score.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3 shrink-0">
              <button 
                onClick={startGame}
                className="w-full bg-[#FFD700] hover:bg-[#f6d000] text-[#333] font-black text-xl md:text-2xl py-3 md:py-4 rounded-[12px] md:rounded-[15px] border-[3px] md:border-[4px] border-[#333] shadow-[0_4px_0_#333] md:shadow-[0_6px_0_#333] uppercase tracking-[1px] md:tracking-[2px] transform transition active:translate-y-2 active:shadow-none"
              >
                PLAY AGAIN
              </button>
              <button 
                onClick={returnToMenu}
                className="w-full bg-[#eee] hover:bg-[#ddd] text-[#555] font-black text-lg md:text-xl py-3 md:py-4 rounded-[12px] md:rounded-[15px] border-[3px] md:border-[4px] border-[#ccc] shadow-[0_4px_0_#ccc] md:shadow-[0_6px_0_#ccc] uppercase tracking-[1px] md:tracking-[2px] transform transition active:translate-y-2 active:shadow-none"
              >
                RETURN TO MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Screen */}
      {status === 'paused' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto animate-in fade-in duration-300">
          <div className="bg-white p-6 md:p-8 rounded-[20px] md:rounded-[30px] border-[4px] md:border-[5px] border-[#333] shadow-[0_6px_0_#333] md:shadow-[0_8px_0_#333] max-w-sm w-full text-center mx-4 flex flex-col max-h-[90dvh]">
            <div className="overflow-y-auto px-2">
                <h2 className="text-4xl md:text-5xl font-black text-[#FF9800] mb-6 md:mb-8 tracking-tighter uppercase drop-shadow-[0_2px_0_#333]">PAUSED</h2>
            </div>
            
            <div className="flex flex-col gap-2 md:gap-3 shrink-0">
              <button 
                onClick={resumeGame}
                className="w-full bg-[#4CAF50] hover:bg-[#43a047] text-white font-black text-xl md:text-2xl py-3 md:py-4 rounded-[12px] md:rounded-[15px] border-[3px] md:border-[4px] border-[#2E7D32] shadow-[0_4px_0_#2E7D32] md:shadow-[0_6px_0_#2E7D32] uppercase tracking-[1px] md:tracking-[2px] transform transition active:translate-y-2 active:shadow-none"
              >
                RESUME
              </button>
              <button 
                onClick={startGame}
                className="w-full bg-[#FFD700] hover:bg-[#f6d000] text-[#333] font-black text-xl md:text-2xl py-3 md:py-4 rounded-[12px] md:rounded-[15px] border-[3px] md:border-[4px] border-[#333] shadow-[0_4px_0_#333] md:shadow-[0_6px_0_#333] uppercase tracking-[1px] md:tracking-[2px] transform transition active:translate-y-2 active:shadow-none"
              >
                RESTART
              </button>
              <button 
                onClick={returnToMenu}
                className="w-full bg-[#eee] hover:bg-[#ddd] text-[#555] font-black text-lg md:text-xl py-3 md:py-4 rounded-[12px] md:rounded-[15px] border-[3px] md:border-[4px] border-[#ccc] shadow-[0_4px_0_#ccc] md:shadow-[0_6px_0_#ccc] uppercase tracking-[1px] md:tracking-[2px] transform transition active:translate-y-2 active:shadow-none"
              >
                RETURN TO MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Hint & Large Touch Zones */}
      {status === 'playing' && (
        <>
          {/* Invisible touch zones for easy mobile tapping */}
          <div className="absolute inset-x-0 bottom-[100px] top-[150px] flex pointer-events-auto">
             <div className="flex-1" onTouchStart={() => useGameStore.getState().setLane(-1)} onClick={() => useGameStore.getState().setLane(-1)}></div>
             <div className="flex-1" onTouchStart={() => useGameStore.getState().setLane(1)} onClick={() => useGameStore.getState().setLane(1)}></div>
          </div>
          
          <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 text-white uppercase font-black text-sm md:text-[18px] tracking-[3px] md:tracking-[5px] opacity-80 text-shadow-[0_2px_4px_rgba(0,0,0,0.5)] w-full text-center pointer-events-none px-4">
            Tap/Swipe Left or Right
          </div>
        </>
      )}
    </div>
  );
}
