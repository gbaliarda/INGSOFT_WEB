import React, { useState, useRef, useEffect } from "react";
import { useMoralis } from "react-moralis";
import Router from "next/router";
import styles from './styles/PveGameplay.module.scss'
import Food from "./gameComponents/Food"
import DirectionInput from "./gameComponents/DirectionInput"
import Particle from "./gameComponents/Particle"
import Snake from "./gameComponents/Snake"

const canvasWidth = 1250;
const canvasHeight = 600;
const fpsInterval = 1000 / 60; // 60 fps

const PveGameplay = () => {
  const canvasRef = useRef();
  const buttonRef = useRef();
  const [score, setScore] = useState(0);
  const [gameOver, setGameover] = useState(true);
  const { isAuthenticated, authenticate, user } = useMoralis();

  let player, food, animationId, particles, ctx, scoreAux, then, elapsed;
  const directionInput = new DirectionInput();

  useEffect(() => {
    if(user == null)
      return;

    ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    buttonRef.current.addEventListener("click", () => {
      setGameover(false);
      init();
      animate();
      scoreAux = 0;
      setScore(0);
    })

    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
      if (width < 2 * radius) radius = width / 2;
      if (height < 2 * radius) radius = height / 2;
      this.beginPath();
      this.moveTo(x + radius, y);
      this.arcTo(x + width, y, x + width, y + height, radius);
      this.arcTo(x + width, y + height, x, y + height, radius);
      this.arcTo(x, y + height, x, y, radius);
      this.arcTo(x, y, x + width, y, radius);
      this.closePath();
      return this;
    }

  }, [user]);

  async function init() {
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    player = new Snake(canvasWidth / 2, canvasHeight / 2, 15, color, 4, "right");
    food = new Food("#ff0040", 8, canvasWidth, canvasHeight)
    
    directionInput.init();
    particles = [];
    
    // user.set("energy", user.attributes.energy-1);
    // await user.save();
    
    then = performance.now()
  }

  async function animate(timestamp) {
    if(Router.pathname != '/pve') {
      cancelAnimationFrame(requestAnimationFrame(animate));
      setGameover(true);
      return;
    }
    animationId = requestAnimationFrame(animate);

    if (!timestamp)
      timestamp = then

    elapsed = timestamp - then
    if (elapsed <= fpsInterval)
      return;

    then = timestamp - (elapsed % fpsInterval)

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
    player.setDirection(directionInput.direction);
    player.update(ctx);
    
    food.draw(ctx);
  
    const dist = Math.hypot(player.x - food.x, player.y - food.y) - food.radius - player.radius;
  
    // colision snake - food
    if (dist < 1) {
      for (let i = 0; i < food.radius * 2; i++) {
        particles.push(
          new Particle(
            food.x, 
            food.y, 
            Math.random() * 2, 
            food.color,
            { 
              x: (Math.random() - 0.5) * (Math.random() * 5), 
              y: (Math.random() - 0.5) * (Math.random() * 5),
            }
        ));
      }
      food = new Food("#ff0040", 8, canvasWidth, canvasHeight);
      scoreAux += 100;
      setScore(scoreAux);
      player.grow();
      player.speedUp();
    }
  
    // particle animation
    particles.forEach((particle, index) => {
      if (particle.alpha <= 0) {
        particles.splice(index, 1);
      } else {
        particle.update(ctx);
      }
    });
  
    // wall collision - gameover
    if (
      player.x - player.radius < 0 || 
      player.x + player.radius > canvasWidth ||
      player.y - player.radius < 0 ||
      player.y + player.radius > canvasHeight
    ) {
      cancelAnimationFrame(animationId);
      setGameover(true);
      user.set("ceAmount", user.attributes.ceAmount+scoreAux/100);
      await user.save();
    }
  }

  return (
    <div className={styles.container}>
        <p className={styles.score}>Puntuación: <span>{score}</span></p>
      <div className={styles.modal} style={{display: gameOver ? "flex" : "none"}}>
        <p className={styles.scoreModal}>Puntuación: {score}</p>
        <p className={styles.scoreModal} style={{display: score > 0 ? "block" : "none"}}>Recompensa: {score / 100} CE</p>
        {!isAuthenticated ? 
          <button onClick={() => authenticate({signingMessage: "CryptoViper quiere acceder a tu MetaMask para iniciar sesión"})}>Iniciar Sesión</button>
        :
          user.attributes.energy <= 0 &&
            <button className={styles.disabled}>No dispones de energía para jugar</button>
        }
        <button style={{display: isAuthenticated && user.attributes.energy > 0 ? "block" : "none"}} ref={buttonRef}>Iniciar juego</button>
      </div>
      <canvas className={styles.canvas} ref={canvasRef}></canvas>
    </div>
  );
}

export default PveGameplay;