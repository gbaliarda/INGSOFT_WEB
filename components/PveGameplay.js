import React, {Component} from 'react';
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
  status: 'inactive',
  score: 0,
  food: getRandomCoordinates(),
  speed: 100,
  direction: 'RIGHT',
  snakeDots: [
    [44,44],
    [46,44]
  ]
}

class PveGameplay extends Component {

  state = { ...initialState };

  componentDidMount() {
    setInterval(this.moveSnake, this.state.speed);
    document.onkeydown = this.onKeyDown;
  }

  componentDidUpdate() {
    this.checkIfOutOfBorders();
    this.checkIfCollapsed();
    this.checkIfEat();
  }

  onKeyDown = (e) => {
    if(this.state.status !== 'active')
      return;

    e = e || window.event;
    switch(e.keyCode) {
      case 38:
        if(this.state.direction != 'DOWN')
          this.setState({direction: 'UP'});
        break;
      case 40:
        if(this.state.direction != 'UP')
          this.setState({direction: 'DOWN'});
        break;
      case 37:
        if(this.state.direction != 'RIGHT')
          this.setState({direction: 'LEFT'});
        break;
      case 39:
        if(this.state.direction != 'LEFT')
          this.setState({direction: 'RIGHT'});
        break;
    }
  }

  moveSnake = () => {
    if(this.state.status !== 'active')
      return;

    let dots = [...this.state.snakeDots];
    let head = dots[dots.length - 1];

    switch (this.state.direction) {
      case 'RIGHT':
        head = [head[0] + 1, head[1]];
        break;
      case 'LEFT':
        head = [head[0] - 1, head[1]];
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
    this.setState({
      snakeDots: dots
    })
  }

  checkIfOutOfBorders() {
    let head = this.state.snakeDots[this.state.snakeDots.length - 1];
    if (head[0] >= 100 || head[1] >= 100 || head[0] < 0 || head[1] < 0) {
      this.onGameOver();
    }
  }

  checkIfCollapsed() {
    let snake = [...this.state.snakeDots];
    let head = snake[snake.length - 1];
    snake.pop();
    snake.forEach(dot => {
      if (head[0] == dot[0] && head[1] == dot[1]) {
        this.onGameOver();
      }
    })
  }

  checkIfEat() {
    let head = this.state.snakeDots[this.state.snakeDots.length - 1];
    let food = this.state.food;
    if (head[0] == food[0] && head[1] == food[1]) {
    let coordsEmpty = true;
    let coords;
    let snake = [...this.state.snakeDots];
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
      this.setState({
        food: coords
      })
      this.addScore();
      this.enlargeSnake();
      this.increaseSpeed();
    }
  }

  addScore() {
    this.state.score += 100;
  }

  enlargeSnake() {
    let newSnake = [...this.state.snakeDots];
    newSnake.unshift([])
    this.setState({
      snakeDots: newSnake
    })
  }

  increaseSpeed() {
    if (this.state.speed > 10) {
      this.setState({
        speed: this.state.speed - 10
      })
    }
  }

  onGameOver() {
    let oldScore = this.state.score;
    this.setState({
      ...initialState,
      status: 'gameover',
      score: oldScore
    });
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.scoreBox}>
          <h2 className={styles.scorePoints}>Puntaje: 
            <p className={styles.scoreNumber}> {this.state.score}</p>
          </h2>
        </div>
        <div className={styles.gameArea}>
          { this.state.status === 'active' && (  
            <div>
              <Snake snakeDots={this.state.snakeDots}></Snake>
              <Food dot={this.state.food}></Food>
            </div>
          )}
          { this.state.status === 'gameover' && (
            <h2 className={styles.showScore}>Perdiste! Tu puntuacion fue de: {this.state.score}</h2>
          )}
          { this.state.status !== 'active' && (
            <button className={styles.startGame} onClick={() => {this.state.status='active'; this.state.score=0}}>Comenzar Juego</button>
          )}
        </div>
      </div>
    )
  }
}

export default PveGameplay;