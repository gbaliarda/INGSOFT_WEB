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
const fpsInterval = 1000 / 60; // limit 60 fps

const PvpGameplay = () => {
  const canvasRef = useRef();
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState(0);
  const [positions, setPositions] = useState([]);
  const [lookingGame, setLookingGame] = useState(false);
  const [gameOver, setGameover] = useState(true);
  const [playerAmount, setPlayerAmount] = useState(0);
  const [waitingForResults, setWaitingForResults] = useState(false);
  const { isAuthenticated, authenticate, user } = useMoralis();
  const socketRef = useRef();

  let player, interval, food, scoreAux, animationId, particles, fogTicks = 0, ctx, then, elapsed;
  const directionInput = new DirectionInput();

  useEffect(() => {
    socketRef.current = io.connect("https://cryptoviper.herokuapp.com");
    // socketRef.current = io.connect("https://cryv-ws.herokuapp.com/");
    // socketRef.current = io.connect("http://localhost:8000");
    return () => {
      socketRef.current.emit("leaving pvp")
    }
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

    socketRef.current.on("user left", (playerAmount) => {
      setPlayerAmount(playerAmount)
    })

    socketRef.current.on("fog tick", () => {
      fogTicks++;
    })

    socketRef.current.on("results finish", async (results) => {
      const newPositions = []
      for(let i = 0; i < results.length; i++) {
        let currPlayer = results[i]
        newPositions.push({id: currPlayer.player.socket, player: currPlayer.player.user, position: i+1, score: currPlayer.score})
        if(currPlayer.player.socket == socketRef.current.id) {
          if(i == 0) {
            user.set("ceAmount", user.attributes.ceAmount+30);
            await user.save();
          }
          setPos(i+1)
        }
      }
      setPositions(newPositions)
      setWaitingForResults(false)
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
    let color, velocity = 3;

    color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    player = new Snake(canvasWidth / 2, canvasHeight / 2, 10, color, velocity, "right");
    food = new Food("#ff0040", 6, fogTicks * 10, canvasWidth, fogTicks * 5, canvasHeight)

    directionInput.init();
    particles = [];
    fogTicks = 0;
    scoreAux = 0;
    setPositions([])
    setScore(0)
    
    user.set("energy", user.attributes.energy-1);
    await user.save();

    interval = setInterval(() => fogTicks++, 3000);

    then = performance.now()
  }

  async function endGame() {
    setWaitingForResults(true)
    setGameover(true)
    cancelAnimationFrame(animationId);
    clearInterval(interval);
  }

  async function animate(timestamp) {
    if(Router.pathname != '/pvp') {
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

    // FOG
    ctx.fillStyle = "#9e3c2b";
    ctx.fillRect(0, 0, fogTicks * 10, canvasHeight);
    ctx.fillRect(canvasWidth-fogTicks*10, 0, fogTicks*10, canvasHeight);
    ctx.fillRect(0, 0, canvasWidth, fogTicks*5);
    ctx.fillRect(0, canvasHeight-fogTicks*5, canvasWidth, fogTicks*5);

    player.setDirection(directionInput.direction);
    player.update(ctx);

    food.draw(ctx);

    const dist = Math.hypot(player.x - food.x, player.y - food.y) - food.radius - player.radius;
  
    // colision snake - food
    if (dist < 1) {
      for (let i = 0; i < food.radius * 3; i++) {
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
      food = new Food("#ff0040", 6, fogTicks * 10, canvasWidth, fogTicks * 5, canvasHeight);
      scoreAux += 100;
      setScore(scoreAux);
      player.grow();
      player.speedUp();
    }

    // food lost on fog
    if (
      food.x - food.radius < fogTicks * 10 || 
      food.x + food.radius > canvasWidth - fogTicks * 10 ||
      food.y - food.radius < fogTicks * 5 ||
      food.y + food.radius > canvasHeight - fogTicks * 5
    ) {
      for (let i = 0; i < food.radius * 3; i++) {
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
      food = new Food("#ff0040", 6, fogTicks * 10, canvasWidth, fogTicks * 5, canvasHeight);
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
      player.x - player.radius < fogTicks * 10 || 
      player.x + player.radius > canvasWidth - fogTicks * 10 ||
      player.y - player.radius < fogTicks * 5 ||
      player.y + player.radius > canvasHeight - fogTicks * 5
    ) {
      socketRef.current.emit("player lost", scoreAux);
      endGame()
    }
  }

  return (
    <div className={styles.container}>
       <p className={styles.score}>Puntuación: <span>{score}</span></p>
      <div className={styles.modal} style={{display: gameOver ? "flex" : "none"}}>
        { waitingForResults && 
          <div>
            <p className={styles.waitingResults}>Esperando resultados</p>
            <div className={styles.spinnerContainer}>
              <Spinner color="#033557"/>
            </div>
          </div>
        }
        {!lookingGame && !waitingForResults && 
          <div className={styles.leaderboard} style={{display: pos > 0 ? "block" : "none"}}>
            <p className={styles.leaderboardTitle}>Tabla de clasificaciones</p>
            <ol>
              {/* {positions.length < 4 && <li><p>??????????? ---- ????</p></li>} */}
              {/* {positions.length < 3 && <li><p>??????????? ---- ????</p></li>} */}
              {positions.length < 2 && <li><p>??????????? ---- ????</p></li>}
              {positions.map(position => {
                return (
                  <li key={position.id}>
                    <p style={{color: position.position == pos ? "#d0db4e" : "#000"}}>{`${position.player.substring(0,5)}...${position.player.slice(-4)} ---- ${position.score}`}</p>
                  </li>
                )
              })}
            </ol>
            <p className={styles.scoreModal}>Recompensa: {pos == 1 ? 30 : 0} CE</p>
          </div>
        }
        {!isAuthenticated ? 
          <button onClick={() => authenticate({signingMessage: "CryptoViper quiere acceder a tu MetaMask para iniciar sesión"})}>Iniciar Sesión</button>
        :
          user.attributes.energy <= 0 &&
            <button className={styles.disabled}>No dispones de energía para jugar</button>
        }
        { !lookingGame ?
          !waitingForResults &&
            <button style={{display: isAuthenticated && user.attributes.energy > 0 ? "block" : "none"}} onClick={lookForGame}>Buscar partida</button>
          
        : 
        <div>
          <p className={styles.scoreModal} style={{marginBottom: "0"}}>Buscando partida...</p>
          <div style={{height: "50px"}}>
            <Spinner color="#033557" />
          </div>
          <p className={styles.scoreModal} style={{marginBottom: "0", marginTop: "10px"}}>Jugadores encontrados {playerAmount}/2</p>
        </div>}
      </div>
      <canvas className={styles.canvas} ref={canvasRef}></canvas>
    </div>
  );
}

export default PvpGameplay;