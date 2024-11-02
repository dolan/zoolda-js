export default class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 9; // Adjust as needed
        this.width = 9; // Adjust as needed
        this.height = 9; // Adjust as needed
    }

    move() {
        // Update bullet position based on direction
        switch(this.direction) {
            case 'up': this.y -= this.speed; break;
            case 'down': this.y += this.speed; break;
            case 'left': this.x -= this.speed; break;
            case 'right': this.x += this.speed; break;
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
