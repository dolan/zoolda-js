// level-generator.js
import { WALL_TILE_IDS } from './Constants.js';

export default class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generateLevel() {
        console.log('Generating level...');
        let level;
        let startX, startY, endX, endY;
        let isPathValid = false;
        let enemies = [];
        let attempts = 0;
        const maxAttempts = 1000;

        // Loop until a valid level with a path is generated or max attempts reached
        while (!isPathValid && attempts < maxAttempts) {
            attempts++;
            console.log(`Attempt ${attempts}...`);
            level = [];
            for (let y = 0; y < this.height; y++) {
                level[y] = new Array(this.width).fill(0); // Initialize with empty space
            }

            // Place player starting position
            startX = Math.floor(Math.random() * this.width);
            startY = Math.floor(Math.random() * this.height);

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
                    if (Math.random() < 0.2) { // 20% chance of a wall (reduced from 30%)
                        level[y][x] = 1; // Place a wall tile
                    }
                }
            }

            // Verify that a path exists using modified A*
            isPathValid = this.hasPathAStar(level, startX, startY, endX, endY);
        }

        if (!isPathValid) {
            console.error('Failed to generate a valid level after maximum attempts');
            // Return a simple, definitely valid level as a fallback
            level = this.generateSimpleFallbackLevel();
            startX = 1;
            startY = 1;
            endX = this.width - 2;
            endY = this.height - 2;
        }

        // Place enemies
        let numEnemies = Math.floor(Math.random() * 5) + 1; // 1-5 enemies
        const enemyTypes = [18, 19, 20, 21]; // Goblin, Orc, Demon, Vampire
        for (let i = 0; i < numEnemies; i++) {
            let enemyX, enemyY, enemyType;
            do {
                enemyX = Math.floor(Math.random() * this.width);
                enemyY = Math.floor(Math.random() * this.height);
                enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            } while (
                level[enemyY][enemyX] !== 0 || 
                (enemyX === startX && enemyY === startY) || 
                (enemyX === endX && enemyY === endY) ||
                enemies.some(e => e.x === enemyX && e.y === enemyY)
            );
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
        const openSet = [];
        const closedSet = new Set();
        const start = {x: startX, y: startY, f: 0, g: 0, h: 0};
        openSet.push(start);

        while (openSet.length > 0) {
            let current = openSet[0];
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            if (current.x === endX && current.y === endY) {
                return true; // Path found
            }

            openSet.splice(currentIndex, 1);
            closedSet.add(`${current.x},${current.y}`);

            const neighbors = [
                {x: current.x - 1, y: current.y},
                {x: current.x + 1, y: current.y},
                {x: current.x, y: current.y - 1},
                {x: current.x, y: current.y + 1}
            ];

            for (let neighbor of neighbors) {
                if (neighbor.x < 0 || neighbor.x >= this.width || neighbor.y < 0 || neighbor.y >= this.height) {
                    continue; // Skip out of bounds
                }

                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    continue; // Skip if in closed set
                }

                const tileType = level[neighbor.y][neighbor.x];
                if (WALL_TILE_IDS.includes(tileType)) {
                    continue; // Skip if it's a wall tile
                }

                const gScore = current.g + 1; // All valid moves cost 1
                const hScore = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
                const fScore = gScore + hScore;

                const existingNeighbor = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
                if (!existingNeighbor) {
                    openSet.push({x: neighbor.x, y: neighbor.y, f: fScore, g: gScore, h: hScore});
                } else if (gScore < existingNeighbor.g) {
                    existingNeighbor.g = gScore;
                    existingNeighbor.f = fScore;
                }
            }
        }

        return false; // No path found
    }

    generateSimpleFallbackLevel() {
        const level = [];
        for (let y = 0; y < this.height; y++) {
            level[y] = new Array(this.width).fill(0);
            if (y === 0 || y === this.height - 1) {
                level[y].fill(1);
            } else {
                level[y][0] = 1;
                level[y][this.width - 1] = 1;
            }
        }
        level[this.height - 2][this.width - 2] = 17; // Place exit
        return level;
    }

    saveLevel(level) {
        return JSON.stringify(level);
    }

    loadLevel(json) {
        return JSON.parse(json);
    }
}
