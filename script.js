const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Player object
const player = {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    speed: 5
};


const tileSize = 32;

class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateLevel() {
        let level = [];
        for (let y = 0; y < this.height; y++) {
            level[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Generate random level data (0 or 1)
                level[y][x] = Math.round(Math.random());
            }
        }
        return level;
    }
}

// Create a level generator instance
const levelGenerator = new LevelGenerator(20, 15); // Example: 20x15 level

// Generate the initial level
let level = levelGenerator.generateLevel();

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Player movement
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw level
    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            if (level[y][x] === 1) {
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // Draw player
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Event listeners for keyboard input
const keys = {};
addEventListener('keydown', e => keys[e.key] = true);
addEventListener('keyup', e => delete keys[e.key]);

// Start the game loop
gameLoop();
