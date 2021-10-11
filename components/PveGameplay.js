import React, { useState, useRef, useEffect } from "react";
import { useInterval } from './gameComponents/useInterval';
import { useMoralis } from "react-moralis";
import styles from './styles/PveGameplay.module.scss'
import {
  CANVAS_SIZE,
  SNAKE_START,
  APPLE_START,
  SCALE,
  SPEED,
  DIRECTIONS 
} from './gameComponents/constant';

function getRandomCoordinates() {
  let x = Math.floor(Math.random() * CANVAS_SIZE[0] / SCALE);
  let y = Math.floor(Math.random() * CANVAS_SIZE[1] / SCALE);
  return [x,y]
}

const PveGameplay = () => {
  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameover] = useState(false);
  const [score, setScore] = useState(0);
  const { isAuthenticated, authenticate, isAuthenticating, authError, logout, user } = useMoralis();

  const startGame = () => {
    if(user.attributes.energy == 0) {
      return;
    }

    let canvas = document.getElementById("canvasPvE");
    canvas.style.display = 'block';


    setScore(0);
    setSnake(SNAKE_START);
    setApple(getRandomCoordinates);
    setDir([0, -1]);
    setSpeed(SPEED);
    setGameover(false);
    document.getElementById("canvasPveContainer").focus();
  }

  const endGame = async () => {
    setSpeed(null);
    setGameover(true);
    let canvas = document.getElementById("canvasPvE");
    canvas.style.display = 'none';
    let scoreText = document.getElementById("scorepve");
    scoreText.textContent = score;
    user.set("energy", user.attributes.energy-1);
    user.set("ceAmount", user.attributes.ceAmount+score/100);
    document.getElementById("winCEAmount").textContent = score/100;
    await user.save();
  }

  const moveSnake = ({keyCode}) => {
    if(!(keyCode in DIRECTIONS))
      return;
    console.log(`dir ${dir} y keycode ${keyCode}`);
    
    if(dir === DIRECTIONS[39] && keyCode === 37 || dir === DIRECTIONS[68] && keyCode === 65)
      return;
    if(dir === DIRECTIONS[37] && keyCode === 39 || dir === DIRECTIONS[65] && keyCode === 68)
      return;

    if(dir === DIRECTIONS[38] && keyCode === 40 || dir === DIRECTIONS[87] && keyCode === 83)
      return;
    if(dir === DIRECTIONS[40] && keyCode === 38 || dir === DIRECTIONS[83] && keyCode === 87)
      return;

    setDir(DIRECTIONS[keyCode]);
  }

  const createApple = () => apple.map((_, i) => Math.floor(Math.random() * CANVAS_SIZE[i] / SCALE));

  const checkCollision = (piece, snk = snake) => {
    if ( piece[0] * SCALE >= CANVAS_SIZE[0] || piece[0] < 0 || piece[1] * SCALE >= CANVAS_SIZE[1] || piece[1] < 0)
      return true;

    for (const segment of snk)
      if (piece[0] === segment[0] && piece[1] === segment[1] )
        return true;
    return false;
  }

  const checkAppleCollision = newSnake => {
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = createApple();
      while (checkCollision(newApple, newSnake)) {
        newApple = createApple();
      }
      setApple(newApple);
      setScore(score+100);
      return true;
    }
    return false;
  }
  
  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [snakeCopy[0][0]+ dir[0], snakeCopy[0][1] + dir[1]];
    snakeCopy.unshift(newSnakeHead);
    if(checkCollision(newSnakeHead))
      endGame();
    if(!checkAppleCollision(snakeCopy))
      snakeCopy.pop();
    setSnake(snakeCopy);
  }

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
    context.fillStyle = "#000";
    snake.forEach(([x,y]) => context.fillRect(x, y, 1 ,1));
    context.fillStyle = "red";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  useInterval(() => gameLoop(), speed);

  return (
      <div className={styles.container}>
        <h2 className={styles.showScore}>Tu puntuacion: {`${score}`}</h2>
        <div className={styles.gameArea} style={{width: `${CANVAS_SIZE[0]}px`, height: `${CANVAS_SIZE[1]}px`}}>
            {gameOver && <div className={styles.gameOverScreen}>Perdiste! <br/> Tu puntuacion: <p className={styles.score} id="scorepve"></p> <br/> Ganaste <p className={styles.score} id="winCEAmount">0</p> CE</div>}
            {isAuthenticated && user.attributes.energy === 0 && <p className={styles.noEnergy}>No tienes energía suficiente para jugar!</p>}
            {isAuthenticated && speed == null && <button onClick={startGame} className={styles.startGameBtn}>Start Game</button>}
            {!isAuthenticated && <button onClick={authenticate} className={styles.loginBtn}>Iniciar Sesión</button>}
          <div role="button" tabIndex="0" onKeyDown={e => moveSnake(e)} id="canvasPveContainer"> 
            <canvas className={styles.canvasStyle} ref={canvasRef} id="canvasPvE" width={`${CANVAS_SIZE[0]}px`} height={`${CANVAS_SIZE[1]}px`} style={{display:"none"}}/>
          </div>
        </div>
      </div>
  );
}

export default PveGameplay;