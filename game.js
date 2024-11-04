import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, TILE_ICONS, WALL_TILE_IDS, BULLET_TILE_ID, CRYSTAL_TILE_ID } from './constants.js';
import Player from './player.js';
import LevelGenerator from './level-generator.js';
import { Goblin, Orc, Demon, Vampire } from './enemy.js';

import Oval from './oval.js';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.ctx.font = "32px Arial";

        this.requiredCrystals = 0;
        this.levelGenerator = new LevelGenerator(30, 20);
        this.bulletCountElement = document.getElementById('bullet-count');
        this.crystalCountElement = document.getElementById('crystal-count');
        this.requiredCrystalsElement = document.getElementById('required-crystals');
        this.initializeGame();

        this.keys = {};
        this.setupEventListeners();

        this.message = null;
        this.messageTimeout = null;
        this.gameActive = true;
        this.bullets = [];
        this.exitOpen = false;
    }

    initializeGame() {
        let validLevel = false;
        while (!validLevel) {
            const { level, startX, startY, endX, endY, enemies, requiredCrystals } = this.levelGenerator.generateLevel();
            if (this.levelGenerator.hasPathAStar(level, startX, startY, endX, endY)) {
                this.level = level.map(row => row.map(tile => 
                    (tile >= 18 && tile <= 21) ? 0 : tile
                )); // Remove monsters from level data
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
                this.requiredCrystals = requiredCrystals;
                this.exitOpen = false;
                validLevel = true;
            }
        }
        this.gameActive = true;
        this.updateStatusDisplay();
    }

    setupEventListeners() {
        document.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            if (e.key === 'Enter' && this.message) {
                this.dismissMessage();
            }
            if (e.key === ' ') {
                this.shootBullet();
                console.log('Spacebar pressed, shootBullet called');
            }
        });
        document.addEventListener('keyup', e => delete this.keys[e.key]);
    }

    shootBullet() {
        const bullet = this.player.shoot();
        if (bullet) {
            this.bullets.push(bullet);
            console.log('Bullet created:', bullet);
        }
        this.updateStatusDisplay();
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
        if (this.keys['ArrowLeft']) {
            this.movePlayer(-this.player.speed, 0);
            this.player.direction = 'left';
        }
        if (this.keys['ArrowRight']) {
            this.movePlayer(this.player.speed, 0);
            this.player.direction = 'right';
        }
        if (this.keys['ArrowUp']) {
            this.movePlayer(0, -this.player.speed);
            this.player.direction = 'up';
        }
        if (this.keys['ArrowDown']) {
            this.movePlayer(0, this.player.speed);
            this.player.direction = 'down';
        }
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
        const radius = (x === this.player.x && y === this.player.y) ? TILE_SIZE / 2 : 1; // Use smaller radius for bullets
        for (const enemy of this.enemies) {
            const dx = enemy.x + TILE_SIZE / 2 - (x + radius);
            const dy = enemy.y + TILE_SIZE / 2 - (y + radius);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < radius + TILE_SIZE * 0.75) { // 0.75 is the enemy collision radius factor
                return enemy; // Return the specific enemy that was hit
            }
        }
        return null; // Return null if no enemy was hit
    }

    isCollisionWithItem(itemX, itemY) {
        const playerCenterX = this.player.x + TILE_SIZE / 2;
        const playerCenterY = this.player.y + TILE_SIZE / 2;
        const itemCenterX = itemX * TILE_SIZE + TILE_SIZE / 2;
        const itemCenterY = itemY * TILE_SIZE + TILE_SIZE / 2;

        const dx = playerCenterX - itemCenterX;
        const dy = playerCenterY - itemCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < TILE_SIZE * 0.75;
    }

    update() {
        if (this.gameActive) {
            this.handleInput();
            
            // Update enemies
            this.enemies.forEach(enemy => {
                enemy.move(this.player, this.level);
            });

            this.checkExit();

            // Update bullets
            if (this.bullets.length > 0) {
                console.log('Updating bullets. Count:', this.bullets.length);
            }
            this.bullets = this.bullets.filter(bullet => {
                bullet.move();
                
                if (this.isCollisionWithWall(bullet.x, bullet.y, 1, 1)) {
                    console.log('Bullet hit wall');
                    return false;
                }
                
                const hitEnemy = this.isCollisionWithEnemy(bullet.x, bullet.y);
                if (hitEnemy) {
                    // Remove only the specific enemy that was hit
                    const enemyIndex = this.enemies.indexOf(hitEnemy);
                    if (enemyIndex !== -1) {
                        this.enemies.splice(enemyIndex, 1);
                        console.log('Bullet hit enemy');
                    }
                    return false;
                }
                
                return true;
            });

            // Check for item collection
            for (let y = 0; y < this.level.length; y++) {
                for (let x = 0; x < this.level[y].length; x++) {
                    const tile = this.level[y][x];
                    if ((tile === BULLET_TILE_ID || tile === CRYSTAL_TILE_ID) && this.isCollisionWithItem(x, y)) {
                        if (tile === BULLET_TILE_ID) {
                            this.player.collectBullet();
                        } else if (tile === CRYSTAL_TILE_ID) {
                            this.player.collectCrystal();
                            if (this.player.crystals === this.requiredCrystals) {
                                this.exitOpen = true;
                                this.showMessage("Exit is now open!", 2000);
                            }
                        }
                        this.level[y][x] = 0;
                        this.updateStatusDisplay();
                    }
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the level
        for (let y = 0; y < this.level.length; y++) {
            for (let x = 0; x < this.level[y].length; x++) {
                const tileId = this.level[y][x];
                const tileIcon = TILE_ICONS[tileId];
                this.ctx.fillText(tileIcon, x * TILE_SIZE, y * TILE_SIZE + TILE_SIZE);
            }
        }

        // Draw player
        this.player.draw(this.ctx);

        // Draw enemies
        this.enemies.forEach(enemy => {
            const previousFillStyle = this.ctx.fillStyle;
            enemy.draw(this.ctx);
            this.ctx.fillStyle = previousFillStyle;
        });

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(this.ctx));

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

        const previousFillStyle = this.ctx.fillStyle;
        
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
        this.ctx.fillStyle = previousFillStyle;
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }

    updateStatusDisplay() {
        this.bulletCountElement.textContent = this.player.bullets;
        this.crystalCountElement.textContent = this.player.crystals;
        this.requiredCrystalsElement.textContent = this.requiredCrystals;
    }

    getEnemyTileId(enemy) {
        if (enemy instanceof Goblin) return 18;
        if (enemy instanceof Orc) return 19;
        if (enemy instanceof Demon) return 20;
        if (enemy instanceof Vampire) return 21;
        return 0;
    }

    isPlayerAtExit() {
        const playerTileX = Math.floor(this.player.x / TILE_SIZE);
        const playerTileY = Math.floor(this.player.y / TILE_SIZE);
        return this.level[playerTileY][playerTileX] === 17 && this.exitOpen;
    }

    gameOver() {
        this.gameActive = false;
        this.showMessage("Game Over! You were caught by an enemy.", 3000);
        setTimeout(() => {
            this.initializeGame();
            this.gameActive = true;
        }, 3000);
    }

    checkExit() {
        const playerTileX = Math.floor(this.player.x / TILE_SIZE);
        const playerTileY = Math.floor(this.player.y / TILE_SIZE);
        
        if (this.level[playerTileY][playerTileX] === 17) {
            if (this.exitOpen) {
                this.gameActive = false;
                this.message = "You escaped! You win!";
            } else {
                this.message = `Collect ${this.requiredCrystals} crystals to open the exit!`;
                setTimeout(() => this.message = null, 2000);
            }
        }
    }
}
