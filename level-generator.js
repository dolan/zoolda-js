// level-generator.js
export default class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateLevel() {
        let level;
        let startX, startY, endX, endY;
        let isPathValid = false;
        let enemies = [];

        // Loop until a valid level with a path is generated
        while (!isPathValid) {
            level = [];
            for (let y = 0; y < this.height; y++) {
                level[y] = new Array(this.width).fill(0); // Initialize with empty space
            }

            // Place player starting position
            do {
                startX = Math.floor(Math.random() * this.width);
                startY = Math.floor(Math.random() * this.height);
            } while (level[startY][startX] !== 0); // Ensure starting position is empty
            // No need to set level[startY][startX] since it's already 0

            // Place exit
            do {
                endX = Math.floor(Math.random() * this.width);
                endY = Math.floor(Math.random() * this.height);
            } while ((endX === startX && endY === startY)); // Ensure exit is not at the start
            level[endY][endX] = 17; // Use a specific tile for the exit (e.g., 17)

            // Generate random walls
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if ((x === startX && y === startY) || (x === endX && y === endY)) {
                        continue; // Do not place walls on start or end positions
                    }
                    if (Math.random() < 0.3) { // 30% chance of a wall
                        level[y][x] = 1; // Place a wall tile
                    }
                }
            }

            // Verify that a path exists using modified A*
            isPathValid = this.hasPathAStar(level, startX, startY, endX, endY);
        }

        // Place enemies
        let numEnemies = Math.floor(Math.random() * 5) + 1; // 1-5 enemies
        for (let i = 0; i < numEnemies; i++) {
            let enemyX, enemyY;
            do {
                enemyX = Math.floor(Math.random() * this.width);
                enemyY = Math.floor(Math.random() * this.height);
            } while (level[enemyY][enemyX] !== 0 || (enemyX === startX && enemyY === startY) || (enemyX === endX && enemyY === endY));
            const enemyType = 18 + Math.floor(Math.random() * 4); // Random enemy type
            level[enemyY][enemyX] = enemyType;
            enemies.push({ x: enemyX, y: enemyY, type: enemyType });
        }

        // Place power-ups (similar to enemies)
        // ...

        return { level, startX, startY, endX, endY, enemies }; // Return the level, positions, and enemies
    }

    /**
     * Modified A* algorithm to check if any path exists from (startX, startY) to (endX, endY).
     * Returns true as soon as a path is found.
     */
    hasPathAStar(level, startX, startY, endX, endY) {
        // ... (rest of the method remains unchanged)
    }

    saveLevel(level) {
        return JSON.stringify(level);
    }

    loadLevel(json) {
        return JSON.parse(json);
    }
}
