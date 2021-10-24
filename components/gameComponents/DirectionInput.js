export default class DirectionInput {

  constructor() {
    this.heldDirections = [];

    this.map = {
      "ArrowUp": "up",
      "KeyW": "up",
      "ArrowDown": "down",
      "KeyS": "down",
      "ArrowLeft": "left",
      "KeyA": "left",
      "ArrowRight": "right",
      "KeyD": "right",
    }

    this.opp = {
      "up": "down",
      "down": "up",
      "left": "right",
      "right": "left",
    }
  }

  get direction() {
    return this.heldDirections[0];
  }

  init() {
    document.addEventListener("keydown", e => {
      e.preventDefault();
      const dir = this.map[e.code];
      if (dir && !this.heldDirections.includes(dir) && !this.heldDirections.includes(this.opp[dir]))
        this.heldDirections.unshift(dir);
    });

    document.addEventListener("keyup", e => {
      this.heldDirections = this.heldDirections.filter(dir => dir != this.map[e.code])
    });
  }

}