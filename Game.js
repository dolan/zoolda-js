import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILE_ICONS, WALL_TILE_IDS } from './Constants.js';
import Player from './Player.js';
import LevelGenerator from './level-generator.js';
import { Goblin, Orc, Demon, Vampire } from './Enemy.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.ctx.font = "32px Arial";

        this.levelGenerator = new LevelGenerator(30, 20);
        this.initializeGame();

        this.keys = {};
        this.setupEventListeners();
    }

    initializeGame() {
        const { level, startX, startY, enemies } = this.levelGenerator.generateLevel();
        this.level = level;
        this.player = new Player(startX * TILE_SIZE, startY * TILE_SIZE);
        this.enemies = enemies.map(enemy => {
            switch(enemy.type) {
                case 18: return new Goblin(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE);
                case 19: return new Orc(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE);
                case 20: return new Demon(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE);
                case 21: return new Vampire(enemy.x * TILE_SIZE, enemy.y * TILE_SIZE);
                default: return null;
            }
        }).filter(enemy => enemy !== null);
    }

    setupEventListeners() {
        document.addEventListener('keydown', e => this.keys[e.key] = true);
        document.addEventListener('keyup', e => delete this.keys[e.key]);
    }

    handleInput() {
        if (this.keys['ArrowLeft']) this.movePlayer(-this.player.speed, 0);
        if (this.keys['ArrowRight']) this.movePlayer(this.player.speed, 0);
        if (this.keys['ArrowUp']) this.movePlayer(0, -this.player.speed);
        if (this.keys['ArrowDown']) this.movePlayer(0, this.player.speed);
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        if (!this.isCollisionWithWall(newX, newY, this.player.width, this.player.height) &&
            !this.isCollisionWithEnemy(newX, newY)) {
            this.player.move(dx, dy);
        }
    }

    isCollisionWithWall(x, y, width, height) {
        const centerTileX = Math.floor(x / TILE_SIZE + 0.5);
        const centerTileY = Math.floor(y / TILE_SIZE + 0.5);

        if (centerTileX < 0 || centerTileX >= this.level[0].length || centerTileY < 0 || centerTileY >= this.level.length) {
            return true;
        }

        return WALL_TILE_IDS.includes(this.level[centerTileY][centerTileX]);
    }

    isCollisionWithEnemy(x, y) {
        const playerRadius = TILE_SIZE / 2;
        const enemyRadius = TILE_SIZE * 0.75; // Larger collision radius for enemies
        return this.enemies.some(enemy => {
            const dx = enemy.x + TILE_SIZE / 2 - (x + playerRadius);
            const dy = enemy.y + TILE_SIZE / 2 - (y + playerRadius);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < playerRadius + enemyRadius;
        });
    }

    update() {
        this.handleInput();
        this.enemies.forEach(enemy => enemy.move(this.player, this.level));
        
        if (this.isCollisionWithEnemy(this.player.x, this.player.y)) {
            console.log("Game Over! Player collided with an enemy.");
            this.gameOver();
        }
    }

    gameOver() {
        // Implement game over logic here
        // For now, we'll just reset the game
        this.initializeGame();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.level.length; y++) {
            for (let x = 0; x < this.level[y].length; x++) {
                const tileId = this.level[y][x];
                const tileIcon = TILE_ICONS[tileId];
                this.ctx.fillText(tileIcon, x * TILE_SIZE, y * TILE_SIZE + TILE_SIZE);
            }
        }

        this.player.draw(this.ctx);
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }
}
