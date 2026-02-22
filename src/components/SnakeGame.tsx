"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food is on snake body
      const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        showError("Game Over! You hit the wall.");
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        showError("Game Over! You hit yourself.");
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood());
        showSuccess("Yum!");
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood, highScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, isPaused, isGameOver]);

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Snake Game</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-mono">{score}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Best: {highScore}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="relative bg-slate-900 rounded-lg overflow-hidden aspect-square w-full border-4 border-slate-800"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
            }}
          >
            {/* Food */}
            <div 
              className="bg-red-500 rounded-full animate-pulse"
              style={{ 
                gridColumnStart: food.x + 1, 
                gridRowStart: food.y + 1 
              }}
            />
            
            {/* Snake */}
            {snake.map((segment, i) => (
              <div 
                key={i}
                className={`${i === 0 ? 'bg-green-400' : 'bg-green-600'} rounded-sm border-[1px] border-slate-900`}
                style={{ 
                  gridColumnStart: segment.x + 1, 
                  gridRowStart: segment.y + 1 
                }}
              />
            ))}

            {/* Overlays */}
            {(isGameOver || isPaused) && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                {isGameOver ? (
                  <>
                    <h2 className="text-3xl font-bold text-white">GAME OVER</h2>
                    <p className="text-white/80">Final Score: {score}</p>
                    <Button onClick={resetGame} size="lg" className="gap-2">
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-white">READY?</h2>
                    <Button onClick={() => setIsPaused(false)} size="lg">
                      Start Game
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="mt-8 grid grid-cols-3 gap-2 max-w-[200px] mx-auto md:hidden">
            <div />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => direction.y !== 1 && setDirection({ x: 0, y: -1 })}
            >
              <ChevronUp />
            </Button>
            <div />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => direction.x !== 1 && setDirection({ x: -1, y: 0 })}
            >
              <ChevronLeft />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => direction.y !== -1 && setDirection({ x: 0, y: 1 })}
            >
              <ChevronDown />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => direction.x !== -1 && setDirection({ x: 1, y: 0 })}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground hidden md:block">
            Use arrow keys to move
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SnakeGame;