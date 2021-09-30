import React, { useState, useEffect, Component } from 'react';
import styles from './styles/PveGameplay.module.scss'
import Snake from './gameComponents/Snake'
import Food from './gameComponents/Food'

const getRandomCoordinates = () => {
  let min = 1;
  let max = 90;
  let x = Math.floor((Math.random()*(max-min+1)+min)/2)*2;
  let y = Math.floor((Math.random()*(max-min+1)+min)/2)*2;
  return [x,y];
}

const initialState = {
  active: true,
  score: 0,
  food: getRandomCoordinates(),
  speed: 100,
  direction: 'RIGHT',
  snakeDots: [
    [44,44],
    [46,44]
  ]
}

export default function PveGameplayFunction()  {

  const [snakeState, setSnakeState] = useState(initialState);

  useEffect(() => {
    if (!snakeState.active) {
      setInterval(moveSnake, snakeState.speed);
      document.onkeydown = onKeyDown;
    }
    else {
      checkIfOutOfBorders();
      checkIfCollapsed();
      checkIfEat();
    }
  }, [snakeState])

  function moveSnake() {
    console.log(snakeState.active);
    if(!snakeState.active)
      return;

    let dots = [...snakeState.snakeDots];
    let head = dots[dots.length - 1];

    switch (snakeState.direction) {
      case 'RIGHT':
        head = [head[0] + 2, head[1]];
        break;
      case 'LEFT':
        head = [head[0] - 2, head[1]];
        break;
      case 'DOWN':
        head = [head[0], head[1] + 2];
        break;
      case 'UP':
        head = [head[0], head[1] - 2];
        break;
    }
    dots.push(head);
    dots.shift();
    setSnakeState({
      ...snakeState,
      snakeDots: dots,
    })
  }

  function onKeyDown(e) {
    if(!snakeState.active)
      return;

    e = e || window.event;
    switch(e.keyCode) {
      case 38:
        if(snakeState.direction != 'DOWN')
          setSnakeState({
            ...snakeState,
            direction: 'UP'
          });
        break;
      case 40:
        if(snakeState.direction != 'UP')
          setSnakeState({
            ...snakeState,
            direction: 'DOWN'
          });
        break;
      case 37:
        if(snakeState.direction != 'RIGHT')
          setSnakeState({
            ...snakeState,
            direction: 'LEFT'
          });
        break;
      case 39:
        if(snakeState.direction != 'LEFT')
          setSnakeState({
            ...snakeState,
            direction: 'RIGHT'
          });
        break;
    }
  }

  function checkIfOutOfBorders() {
    let head = snakeState.snakeDots[snakeState.snakeDots.length - 1];
    if (head[0] >= 100 || head[1] >= 100 || head[0] < 0 || head[1] < 0) {
      onGameOver();
    }
  }

  function checkIfCollapsed() {
    let snake = [...snakeState.snakeDots];
    let head = snake[snake.length - 1];
    snake.pop();
    snake.forEach(dot => {
      if (head[0] == dot[0] && head[1] == dot[1]) {
        onGameOver();
      }
    })
  }

  function checkIfEat() {
    let head = snakeState.snakeDots[snakeState.snakeDots.length - 1];
    let food = snakeState.food;
    if (head[0] == food[0] && head[1] == food[1]) {
    let coordsEmpty = true;
    let coords;
    let snake = [...snakeState.snakeDots];
    while (coordsEmpty) {
      coordsEmpty = false;
      coords = getRandomCoordinates();
      snake.forEach(dot => {
        if (coords[0] == dot[0] && coords[1] == dot[1]) {
          coordsEmpty = true;
        }
      })
    }
    
    snake.forEach
      setSnakeState({
        ...snakeState,
        food: coords
      })
      snakeState.score += 100;
      enlargeSnake();
      increaseSpeed();
    }
  }

  function enlargeSnake() {
    let newSnake = [...snakeState.snakeDots];
    newSnake.unshift([])
    setSnakeState({
      ...snakeState,
      snakeDots: newSnake
    })
  }

  function increaseSpeed() {
    if (snakeState.speed > 10) {
      setSnakeState({
        ...snakeState,
        speed: snakeState.speed - 10
      })
    }
  }

  function onGameOver() {
    alert('Game Over');
    //setSnakeState(initialState);
  }

  return (
    <div className={styles.container}>
      <div className={styles.scoreBox}>
        <h2 className={styles.scorePoints}>Puntaje: 
          <p className={styles.scoreNumber}> {snakeState.score}</p>
        </h2>
      </div>
      <div className={styles.gameArea}>
        { snakeState.active ? (  
          <div>
            <Snake snakeDots={snakeState.snakeDots}></Snake>
            <Food dot={snakeState.food}></Food>
          </div>
        ) : (
          <button className={styles.startGame} onClick={() => setSnakeState({
            ...snakeState,
            active: true,
          })}>Comenzar Juego</button>
        )}
      </div>
    </div>
  )
}
