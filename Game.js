import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILE_ICONS, WALL_TILE_IDS, BULLET_TILE_ID } from './Constants.js';
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

        this.message = null;
        this.messageTimeout = null;
        this.gameActive = true;
        this.bullets = [];
    }

    initializeGame() {
        let validLevel = false;
        while (!validLevel) {
            const { level, startX, startY, enemies } = this.levelGenerator.generateLevel();
            if (this.levelGenerator.hasPathAStar(level, startX, startY, level.findIndex(row => row.includes(17)), level[level.findIndex(row => row.includes(17))].indexOf(17))) {
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
                validLevel = true;
            }
        }
        this.gameActive = true;
    }

    setupEventListeners() {
        document.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            if (e.key === 'Enter' && this.message) {
                this.dismissMessage();
            }
            if (e.key === ' ') {
                this.shootBullet();
            }
        });
        document.addEventListener('keyup', e => delete this.keys[e.key]);
    }

    shootBullet() {
        const bullet = this.player.shoot();
        if (bullet) {
            this.bullets.push(bullet);
        }
    }

    showMessage(text, duration = 5000) {
        this.message = text;
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }
        this.messageTimeout = setTimeout(() => this.dismissMessage(), duration);
    }

    dismissMessage() {
        this.message = null;
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
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
        if (this.gameActive) {
            this.handleInput();
            this.enemies.forEach(enemy => enemy.move(this.player, this.level));
            
            if (this.isCollisionWithEnemy(this.player.x, this.player.y)) {
                this.gameOver();
            }

            if (this.isPlayerAtExit()) {
                this.gameActive = false;
                this.showMessage("Congratulations! You've reached the exit!", 3000);
                setTimeout(() => {
                    this.initializeGame();
                    this.gameActive = true;
                }, 3000);
            }

            // Update bullets
            this.bullets = this.bullets.filter(bullet => {
                bullet.move();
                const tileX = Math.floor(bullet.x / TILE_SIZE);
                const tileY = Math.floor(bullet.y / TILE_SIZE);
                if (this.isCollisionWithWall(bullet.x, bullet.y, 1, 1)) {
                    return false; // Remove bullet if it hits a wall
                }
                // Check for collision with enemies
                this.enemies = this.enemies.filter(enemy => {
                    if (this.isCollision(bullet.x, bullet.y, 1, 1, enemy.x, enemy.y, enemy.width, enemy.height)) {
                        return false; // Remove enemy if hit by bullet
                    }
                    return true;
                });
                return true; // Keep bullet in the array
            });

            // Check if player collects a bullet
            const playerTileX = Math.floor(this.player.x / TILE_SIZE);
            const playerTileY = Math.floor(this.player.y / TILE_SIZE);
            if (this.level[playerTileY][playerTileX] === BULLET_TILE_ID) {
                this.player.collectBullet();
                this.level[playerTileY][playerTileX] = 0; // Remove bullet from level
            }
        }
    }

    isPlayerAtExit() {
        const playerTileX = Math.floor(this.player.x / TILE_SIZE);
        const playerTileY = Math.floor(this.player.y / TILE_SIZE);
        return this.level[playerTileY][playerTileX] === 17; // 17 is the exit tile
    }

    gameOver() {
        this.gameActive = false;
        this.showMessage("Game Over! You were caught by an enemy.", 3000);
        setTimeout(() => {
            this.initializeGame();
            this.gameActive = true;
        }, 3000);
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
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

        // Draw bullet count
        this.ctx.fillText(`Bullets: ${this.player.bullets}`, 10, 30);

        if (this.message) {
            this.drawMessage();
        }
    }

    drawMessage() {
        const padding = 20;
        const lineHeight = 40;
        const lines = this.message.split('\n');
        const messageWidth = Math.max(...lines.map(line => this.ctx.measureText(line).width)) + padding * 2;
        const messageHeight = lines.length * lineHeight + padding * 2;

        const x = (this.canvas.width - messageWidth) / 2;
        const y = (this.canvas.height - messageHeight) / 2;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, messageWidth, messageHeight);

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '24px Arial';

        lines.forEach((line, index) => {
            this.ctx.fillText(line, this.canvas.width / 2, y + padding + lineHeight * (index + 0.5));
        });

        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.font = '32px Arial';
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
