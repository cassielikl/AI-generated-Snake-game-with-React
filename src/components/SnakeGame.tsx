import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const directionRef = useRef<Direction>(direction);
  directionRef.current = direction;

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setHasStarted(true);
    setIsPaused(false);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      e.preventDefault();
      if (!hasStarted) setHasStarted(true);
    }

    if (e.key === ' ') {
      e.preventDefault();
      if (gameOver) {
        resetGame();
      } else if (hasStarted) {
        setIsPaused(p => !p);
      }
      return;
    }

    if (gameOver || isPaused) return;

    const currentDir = directionRef.current;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (currentDir !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDir !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDir !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDir !== 'LEFT') setDirection('RIGHT');
        break;
    }
  }, [gameOver, isPaused, hasStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver || isPaused || !hasStarted) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (directionRef.current) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Check wall collision
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 10);
    const intervalId = setInterval(moveSnake, speed);

    return () => clearInterval(intervalId);
  }, [direction, food, gameOver, isPaused, hasStarted, score]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 px-2">
        <div className="text-cyan-400 font-mono text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
        {gameOver && (
          <div className="text-red-500 font-mono text-xl animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            GAME OVER
          </div>
        )}
      </div>

      <div 
        className="relative bg-black/60 border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden"
        style={{ 
          width: '400px', 
          height: '400px',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Food */}
        <div 
          className="bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,1)] animate-pulse"
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1,
            margin: '2px'
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`${isHead ? 'bg-cyan-300' : 'bg-cyan-500'} rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.8)]`}
              style={{
                gridColumnStart: segment.x + 1,
                gridRowStart: segment.y + 1,
                margin: '1px',
                zIndex: isHead ? 10 : 1
              }}
            />
          );
        })}

        {/* Overlays */}
        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-20">
            <div className="text-center">
              <p className="text-cyan-400 font-mono text-xl mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">READY?</p>
              <p className="text-white/70 font-mono text-sm">Press any arrow key to start</p>
            </div>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
            <p className="text-cyan-400 font-mono text-2xl tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">PAUSED</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <p className="text-red-500 font-mono text-3xl mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">GAME OVER</p>
            <p className="text-cyan-400 font-mono text-xl mb-6">FINAL SCORE: {score}</p>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-transparent border border-cyan-400 text-cyan-400 font-mono hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.8)]"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-white/50 font-mono text-xs text-center max-w-[400px]">
        Use <span className="text-cyan-400">Arrow Keys</span> or <span className="text-cyan-400">WASD</span> to move. 
        Press <span className="text-cyan-400">Space</span> to pause/resume.
      </div>
    </div>
  );
}
