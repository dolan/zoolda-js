import { TILE_SIZE } from './Constants.js';

export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.icon = '🧙';
        this.speed = 5;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    draw(ctx) {
        ctx.fillText(this.icon, this.x, this.y + TILE_SIZE);
    }
}
