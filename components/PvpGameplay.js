import React, { useState, useRef, useEffect } from "react";
import { useMoralis } from "react-moralis";
import Router from "next/router";
import styles from './styles/PveGameplay.module.scss'
import Food from "./gameComponents/Food"
import DirectionInput from "./gameComponents/DirectionInput"
import Particle from "./gameComponents/Particle"
import Snake from "./gameComponents/Snake"
import Spinner from "./Spinner"
// Socket.io
import io from "socket.io-client";

const canvasWidth = 1250;
const canvasHeight = 600;

const PvpGameplay = () => {
  const canvasRef = useRef();
  const buttonRef = useRef();
  const [score, setScore] = useState(0);
  const [lookingGame, setLookingGame] = useState(false);
  const [gameOver, setGameover] = useState(true);
  const { isAuthenticated, authenticate, user } = useMoralis();
  const socketRef = useRef();

  let player, enemies = [], animationId, particles, ctx, scoreAux;
  const directionInput = new DirectionInput();

  const roomID = 1;

  useEffect(() => {
    // SOCKETS
    socketRef.current = io.connect("http://localhost:8000");
  }, [])

  const lookForGame = () => {
    setLookingGame(true)
    console.log(`${user.attributes.ethAddress} looking for game`)
    socketRef.current.emit("join room", user.attributes.ethAddress)
  }

  useEffect(() => {
    if(user == null)
      return;

    socketRef.current.on("start game", (users) => {
      setLookingGame(false);
      users.forEach((user) => console.log(user));

      setGameover(false);
      init(users);
      animate();
      scoreAux = 0;
      setScore(0);
    })

    socketRef.current.on("room full", (wallet) => {
      console.log(`User ${wallet} joined`);
    })

    socketRef.current.on("user joined", (user) => {
      console.log(`${user} joined`)
    })

    // GAME
    ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

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

  const init = async (users) => {
    let color;

    for(let i = 0; i < users.length; i++) {
      let currentPos = userPosition(i)
      if (users[i] == socketRef.current.id) {
        color = "white";
        player = new Snake(currentPos.x, currentPos.y, 10, color, 4, currentPos.dir);
      }
      else {
        color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        enemies.push(new Snake(currentPos.x, currentPos.y, 10, color, 4, currentPos.dir));
      }
    }

    directionInput.init();
    particles = [];
    
    // user.set("energy", user.attributes.energy-1);
    // await user.save();
  }

  const userPosition = (pos) => {
    switch(pos) {
      case 0:
        return {x: 10, y: canvasHeight/2, dir: "right"} // left
        break;
      case 1:
        return {x: canvasWidth/2, y: 10, dir:"down"} // top
        break;
      case 2:
        return {x: canvasWidth-10, y: canvasHeight/2, dir: "left"} //w
        break;
      case 3:
        return {x: canvasWidth/2,  y: canvasHeight-10, dir: "up"}
        break;
    }
  }

  async function animate() {
    if(Router.pathname != '/pvp') {
      cancelAnimationFrame(requestAnimationFrame(animate));
      setGameover(true);
      return;
    }
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
    player.setDirection(directionInput.direction);
    player.update(ctx);
  
    enemies.forEach(enemy => enemy.update(ctx));
    
    // colision snake - food
    // const dist = Math.hypot(player.x - food.x, player.y - food.y) - food.radius - player.radius;
    // if (dist < 1) {
    //   for (let i = 0; i < food.radius * 2; i++) {
    //     particles.push(
    //       new Particle(
    //         food.x, 
    //         food.y, 
    //         Math.random() * 2, 
    //         food.color,
    //         { 
    //           x: (Math.random() - 0.5) * (Math.random() * 5), 
    //           y: (Math.random() - 0.5) * (Math.random() * 5),
    //         }
    //     ));
    //   }
    //   food = new Food("#ff0040", 8, canvasWidth, canvasHeight);
    //   scoreAux += 100;
    //   setScore(scoreAux);
    //   player.grow();
    //   player.speedUp();
    // }
  
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
          user.attributes.energy == 0 &&
            <button className={styles.disabled}>No dispones de energía para jugar</button>
        }
        { !lookingGame ?
        <button style={{display: isAuthenticated && user.attributes.energy > 0 ? "block" : "none"}} onClick={lookForGame}>Buscar partida</button>
        : 
        <div>
          <Spinner />
        </div>}
      </div>
      <canvas className={styles.canvas} ref={canvasRef}></canvas>
    </div>
  );
}

export default PvpGameplay;