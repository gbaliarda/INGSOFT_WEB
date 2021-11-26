export default class Snake {

  constructor(x, y, radius, color, velocity, direction) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.direction = direction;
    this.cells = [];
    this.length = 20;
  }

  isValidDirection(direction) {
    if (
      !direction 
      || (this.direction == "up" && direction == "down") 
      || (this.direction == "down" && direction == "up") 
      || (this.direction == "left" && direction == "right") 
      || (this.direction == "right" && direction == "left")
    )
      return false;
    return true;
  }

  setDirection(direction) {
    if (this.isValidDirection(direction))
      this.direction = direction;
  }

  grow() {
    this.length += 5;
  }

  speedUp() {
    this.velocity += 0.5;
  }

  draw(ctx) {
    const r = this.radius;
    this.cells.forEach(cell => {
      // Rectangulo redondeado centrado en (cell.x, cell.y)
      ctx.roundRect(cell.x - r, cell.y - r, 2*r, 2*r, r);
      ctx.fillStyle = this.color;
      ctx.fill();
    });
  }

  update(ctx) {
    this.cells.unshift({ x: this.x, y: this.y });

    if (this.cells.length > this.length)
      this.cells.pop()

    this.draw(ctx);
  }

}