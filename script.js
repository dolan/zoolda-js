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
    width: tileSize, // Player occupies one tile
    height: tileSize,
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
        const level = [];
        for (let y = 0; y < this.height; y++) {
            level[y] = new Array(this.width).fill(0); // Initialize with empty space
        }

        // Place player starting position
        startX = Math.floor(Math.random() * this.width);
        startY = Math.floor(Math.random() * this.height);
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

// Declare startX and startY outside the function scope
let startX, startY;

// Generate the initial level
level = levelGenerator.generateLevel();

// Set player's initial position
player.x = startX * tileSize;
player.y = startY * tileSize;

// Define wall tile IDs
const wallTileIds = [1, 5, 8]; // Example: Trees, mountains, dense forest

// Game loop
function gameLoop() {
    handleInput();
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handleInput() {
    // Player movement
    if (keys['ArrowLeft']) {
        movePlayer(-player.speed, 0);
    }
    if (keys['ArrowRight']) {
        movePlayer(player.speed, 0);
    }
    if (keys['ArrowUp']) {
        movePlayer(0, -player.speed);
    }
    if (keys['ArrowDown']) {
        movePlayer(0, player.speed);
    }
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    // Collision detection with walls
    if (!isCollisionWithWall(newX, newY, player.width, player.height)) {
        player.x = newX;
        player.y = newY;
    }
}

function isCollisionWithWall(x, y, width, height) {
    // Convert pixel coordinates to tile coordinates
    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    const tileXRight = Math.floor((x + width) / tileSize);
    const tileYBottom = Math.floor((y + height) / tileSize);

    // Check for out-of-bounds
    if (tileX < 0 || tileXRight >= level[0].length || tileY < 0 || tileYBottom >= level.length) {
        return true;
    }

    // Check if any corner of the player is inside a wall tile
    return wallTileIds.includes(level[tileY][tileX]) ||
           wallTileIds.includes(level[tileY][tileXRight]) ||
           wallTileIds.includes(level[tileYBottom][tileX]) ||
           wallTileIds.includes(level[tileYBottom][tileXRight]);
}

function update() {
    // Add any other game logic here (e.g., enemy movement)
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
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => delete keys[e.key]);

// Start the game loop
gameLoop();
