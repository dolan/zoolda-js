export default class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateLevel() {
        let startX, startY;
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

        this.generatePath(level, startX, startY, endX, endY);

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

        // Generate random walls
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (level[y][x] === 0 && Math.random() < 0.3) { // 30% chance of a wall
                    level[y][x] = 1; // Place a wall tile
                }
            }
        }

        return level;
    }

    generatePath(level, startX, startY, endX, endY) {
        let currentX = startX;
        let currentY = startY;

        while (currentX !== endX || currentY !== endY) {
            // Determine direction to move closer to the end
            let dx = endX - currentX;
            let dy = endY - currentY;

            // Choose either horizontal or vertical movement
            if (Math.random() < 0.5) {
                if (dx !== 0) {
                    currentX += Math.sign(dx);
                } else if (dy !== 0) {
                    currentY += Math.sign(dy);
                }
            } else {
                if (dy !== 0) {
                    currentY += Math.sign(dy);
                } else if (dx !== 0) {
                    currentX += Math.sign(dx);
                }
            }

            // Ensure we stay within the bounds of the level
            currentX = Math.max(0, Math.min(currentX, this.width - 1));
            currentY = Math.max(0, Math.min(currentY, this.height - 1));

            // Clear the path tile
            level[currentY][currentX] = 0;
        }
    }
}
