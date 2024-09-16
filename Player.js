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
            let dx = 0, dy = 0;
            switch (this.facing) {
                case 'right': dx = 1; break;
                case 'left': dx = -1; break;
                case 'down': dy = 1; break;
                case 'up': dy = -1; break;
            }
            return new Bullet(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, dx, dy);
        }
        return null;
    }
}

class Bullet {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = 10;
        this.icon = '•';
    }

    move() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
    }

    draw(ctx) {
        ctx.fillText(this.icon, this.x, this.y);
    }
}
