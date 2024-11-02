export default class Oval {
  constructor(x, y, width, height, isWalkable, fillRate = 0.7) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isWalkable = isWalkable;
    this.fillRate = fillRate;
  }

  isInside(x, y) {
    const normalizedX = (x - this.x - this.width / 2) / (this.width / 2);
    const normalizedY = (y - this.y - this.height / 2) / (this.height / 2);
    return (normalizedX * normalizedX + normalizedY * normalizedY <= 1) && Math.random() < this.fillRate;
  }
}
