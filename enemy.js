import { TILE_SIZE } from './constants.js';

export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.detectionRadius = 5 * TILE_SIZE;
        this.speed = 2;
        this.moveCounter = 0;
        this.moveInterval = 30; // Move every 30 frames
    }

    move(player, level) {
        this.moveCounter++;
        if (this.moveCounter < this.moveInterval) return;
        this.moveCounter = 0;

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.detectionRadius) {
            this.moveTowardsPlayer(player, level);
        } else {
            this.moveRandomly(level);
        }
    }

    moveTowardsPlayer(player, level) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        let newX = this.x + Math.cos(angle) * this.speed;
        let newY = this.y + Math.sin(angle) * this.speed;

        if (!this.isCollision(newX, newY, level)) {
            this.x = newX;
            this.y = newY;
        }
    }

    moveRandomly(level) {
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;

        if (!this.isCollision(newX, newY, level)) {
            this.x = newX;
            this.y = newY;
        }
    }

    isCollision(x, y, level) {
        const tileX = Math.floor(x / TILE_SIZE);
        const tileY = Math.floor(y / TILE_SIZE);
        return level[tileY] && level[tileY][tileX] === 1; // Assuming 1 is a wall
    }

    draw(ctx) {
        ctx.fillText(this.type, this.x, this.y + TILE_SIZE);
    }
}

export class Goblin extends Enemy {
    constructor(x, y) {
        super(x, y, '👹');
        this.speed = 3.5;
        this.detectionRadius = 4 * TILE_SIZE;
    }
}

export class Orc extends Enemy {
    constructor(x, y) {
        super(x, y, '👿');
        this.speed = 3;
        this.detectionRadius = 6 * TILE_SIZE;
    }
}

export class Demon extends Enemy {
    constructor(x, y) {
        super(x, y, '😈');
        this.speed = 5;
        this.detectionRadius = 7 * TILE_SIZE;
    }

    move(player, level) {
        super.move(player, level);
        // Demons move diagonally
        if (this.moveCounter === 0) {
            const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            const [dx, dy] = diagonalDirections[Math.floor(Math.random() * diagonalDirections.length)];
            const newX = this.x + dx * this.speed;
            const newY = this.y + dy * this.speed;
            if (!this.isCollision(newX, newY, level)) {
                this.x = newX;
                this.y = newY;
            }
        }
    }
}

export class Vampire extends Enemy {
    constructor(x, y) {
        super(x, y, '🧛');
        this.speed = 3;
        this.detectionRadius = 8 * TILE_SIZE;
    }

    move(player, level) {
        this.moveCounter++;
        if (this.moveCounter < this.moveInterval) return;
        this.moveCounter = 0;

        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.detectionRadius) {
            // Move away from player when detected
            const angle = Math.atan2(dy, dx);
            const newX = this.x + Math.cos(angle) * this.speed;
            const newY = this.y + Math.sin(angle) * this.speed;
            if (!this.isCollision(newX, newY, level)) {
                this.x = newX;
                this.y = newY;
            }
        } else {
            this.moveRandomly(level);
        }
    }
}
