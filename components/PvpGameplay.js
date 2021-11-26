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
  const [playerAmount, setPlayerAmount] = useState(0);
  const { isAuthenticated, authenticate, user } = useMoralis();
  const socketRef = useRef();

  let player, enemies = {}, animationId, particles, fogTicks = 0, ctx;
  const directionInput = new DirectionInput();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:8000");
  }, [])

  const lookForGame = () => {
    setLookingGame(true)
    socketRef.current.emit("join room", user.attributes.ethAddress)
  }

  useEffect(() => {
    if(user == null)
      return;

    // SOCKETS
    socketRef.current.on("start game", (users) => {
      setLookingGame(false);
      users.forEach((user) => console.log(user));

      setGameover(false);
      init(users);
      animate();
      setScore(0);
    })

    socketRef.current.on("user joined", (playerAmount) => {
      setPlayerAmount(playerAmount)
    })

    socketRef.current.on("update direction", ({id, direction}) => {
      enemies[id].setDirection(direction)
    })

    socketRef.current.on("fog tick", () => {
      fogTicks++;
    })

    socketRef.current.on("player died", (id) => {
      enemies[id].cells.forEach(cell => {
        for (let i = 0; i < enemies[id].radius; i++) {
          particles.push(
            new Particle(
              cell.x, 
              cell.y, 
              Math.random() * 2,
              enemies[id].color,
              { 
                x: (Math.random() - 0.5) * (Math.random() * 5), 
                y: (Math.random() - 0.5) * (Math.random() * 5),
              }
          ));
        }
      })
      delete enemies[id]
    
      if(Object.keys(enemies).length == 0) {
        socketRef.current.emit("game over")
        endGame()
        console.log("Ganaste!");
      }
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
        player = new Snake(currentPos.x, currentPos.y, 10, color, 3, currentPos.dir);
      }
      else {
        color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        enemies[users[i]] = new Snake(currentPos.x, currentPos.y, 10, color, 3, currentPos.dir);
      }
    }

    directionInput.init();
    particles = [];
    fogTicks = 0;
    
    user.set("energy", user.attributes.energy-1);
    await user.save();
  }

  async function endGame() {
    cancelAnimationFrame(animationId);
    setGameover(true);
    setScore(Object.keys(enemies).length + 1)

    if (Object.keys(enemies).length == 0)
      user.set("ceAmount", user.attributes.ceAmount + 30);
    else if (Object.keys(enemies).length == 1)
      user.set("ceAmount", user.attributes.ceAmount + 10);

    await user.save();
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
      setGameover(true);
      return;
    }
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // FOG
    ctx.fillStyle = "#9e3c2b";
    ctx.fillRect(0, 0, fogTicks * 10, canvasHeight);
    ctx.fillRect(canvasWidth-fogTicks*10, 0, fogTicks*10, canvasHeight);
    ctx.fillRect(0, 0, canvasWidth, fogTicks*5);
    ctx.fillRect(0, canvasHeight-fogTicks*5, canvasWidth, fogTicks*5);
  
    if (player.direction != directionInput.direction) {
      socketRef.current.emit("change direction", directionInput.direction);
      player.setDirection(directionInput.direction);
    }

    player.update(ctx);

    Object.entries(enemies).forEach(([id, enemy]) => {
      enemy.update(ctx);
      
      // colision player - enemies o enemy - enemy
      enemy.cells.every(cell => {
        const dist = Math.hypot(player.x - cell.x, player.y - cell.y) - enemy.radius - player.radius;
        if (dist < 1) {

          // gana por desempate por ID
          if (cell.x == enemy.x && cell.y == enemy.y && socketRef.current.id.localeCompare(id) < 0)
            return false

          socketRef.current.emit("players collision");
          endGame()
          return false
        }
        return true
      })
    })
  
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
      player.x - player.radius < fogTicks * 10 || 
      player.x + player.radius > canvasWidth - fogTicks * 10 ||
      player.y - player.radius < fogTicks * 5 ||
      player.y + player.radius > canvasHeight - fogTicks * 5
    ) {
      socketRef.current.emit("players collision");
      endGame()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.modal} style={{display: gameOver ? "flex" : "none"}}>
        {!lookingGame &&
          <div>
            <p className={styles.scoreModal} style={{display: score > 0 ? "block" : "none"}}>Terminaste en la posicion N°{score}!</p>
            <p className={styles.scoreModal} style={{display: score > 0 ? "block" : "none"}}>Recompensa: {score == 1 ? 30 : (score == 2 ? 10 : 0)} CE</p>
          </div>
        }
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
          <p className={styles.scoreModal} style={{marginBottom: "0"}}>Buscando partida...</p>
          <div style={{height: "50px"}}>
            <Spinner color="#033557" />
          </div>
          <p className={styles.scoreModal} style={{marginBottom: "0", marginTop: "10px"}}>Jugadores encontrados {playerAmount}/4</p>
        </div>}
      </div>
      <canvas className={styles.canvas} ref={canvasRef}></canvas>
    </div>
  );
}

export default PvpGameplay;