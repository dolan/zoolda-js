const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

ctx.font = "32px Arial"; // Set font for tile rendering

const tileSize = 32;

// Player object
const player = {
    x: 100,
    y: 100,
    icon: '🧙', // Example: Mage character
    speed: 5
};

const tileIcons = {
    0: ' ', // Empty space
    1: '🌳', // Tree
    2: '.', // Dirt road
    3: ',', // Low grass
    4: '⛁', // Gravel
    5: '⛰️', // Mountainous rocks
    6: '/', // Slanted hill (left)
    7: '\\', // Slanted hill (right)
    8: '🌲', // Rough and dense forest
    9: '🌿', // Swamp land
    10: '〰️', // Stream
    11: '🌊', // River
    12: '💧', // Pond
    13: '💙', // Lake
    14: '💦', // Brook
    15: '🏞️', // Waterfall
    16: '❤️', // Health bonus
    17: '🇨🇭', // Large life power-up
    18: '👹', // Goblin
    19: '👿', // Orc
    20: '😈', // Demon
    21: '🧛', // Vampire
};

class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateLevel() {
        let level = [];
        for (let y = 0; y < this.height; y++) {
            level[y] = new Array(this.width).fill(0); // Initialize with empty space
        }

        // Place player starting position
        let startX = Math.floor(Math.random() * this.width);
        let startY = Math.floor(Math.random() * this.height);
        level[startY][startX] = 0; // Ensure starting position is empty

        // Place exit
        let endX, endY;
        do {
            endX = Math.floor(Math.random() * this.width);
            endY = Math.floor(Math.random() * this.height);
        } while (endX === startX && endY === startY); // Ensure exit is not at the start
        level[endY][endX] = 17; // Use a specific tile for the exit (e.g., 17)

        // Place enemies
        let numEnemies = Math.floor(Math.random() * 5) + 1; // 1-5 enemies
        for (let i = 0; i < numEnemies; i++) {
            let enemyX, enemyY;
            do {
                enemyX = Math.floor(Math.random() * this.width);
                enemyY = Math.floor(Math.random() * this.height);
            } while (level[enemyY][enemyX] !== 0); // Ensure enemy is placed on empty space
            level[enemyY][enemyX] = 18 + Math.floor(Math.random() * 4); // Random enemy type
        }

        // Place power-ups (similar to enemies)
        // ...

        return level;
    }
}

// Create a level generator instance
const levelGenerator = new LevelGenerator(30, 20); // Example: 30x20 level

// Generate the initial level
let level = levelGenerator.generateLevel();

// Set player's initial position
player.x = startX * tileSize;
player.y = startY * tileSize;

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
            const tileId = level[y][x];
            const tileIcon = tileIcons[tileId];
            ctx.fillText(tileIcon, x * tileSize, y * tileSize + tileSize);
        }
    }

    // Draw player
    ctx.fillText(player.icon, player.x, player.y + tileSize);
}

// Event listeners for keyboard input
const keys = {};
addEventListener('keydown', e => keys[e.key] = true);
addEventListener('keyup', e => delete keys[e.key]);

// Start the game loop
gameLoop();
