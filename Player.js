import { TILE_SIZE, BULLET_TILE_ID } from './Constants.js';

export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.icon = '🧙';
        this.speed = 5;
        this.bullets = 0;
        this.facing = 'right'; // Default facing direction
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        if (dx > 0) this.facing = 'right';
        else if (dx < 0) this.facing = 'left';
        else if (dy > 0) this.facing = 'down';
        else if (dy < 0) this.facing = 'up';
    }

    draw(ctx) {
        ctx.fillText(this.icon, this.x, this.y + TILE_SIZE);
    }

    collectBullet() {
        this.bullets++;
    }

    shoot() {
        if (this.bullets > 0) {
            this.bullets--;
            console.log('Player shooting. Direction:', this.direction);
            return new Bullet(this.x + this.width / 2, this.y + this.height / 2, this.direction);
        }
        return null;
    }
}

class Bullet {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 5; // Adjust as needed
        this.width = 5; // Adjust as needed
        this.height = 5; // Adjust as needed
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
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
