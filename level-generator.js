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
            level[enemyY][enemyX] = 18 + Math.floor(Math.random() * 4); // Random enemy type
        }

        // Place power-ups (similar to enemies)
        // ...

        return { level, startX, startY, endX, endY }; // Return the level and positions
    }

    /**
     * Modified A* algorithm to check if any path exists from (startX, startY) to (endX, endY).
     * Returns true as soon as a path is found.
     */
    hasPathAStar(level, startX, startY, endX, endY) {
        // Define the Node structure
        class Node {
            constructor(x, y, g, h, parent = null) {
                this.x = x;
                this.y = y;
                this.g = g; // Cost from start to this node
                this.h = h; // Heuristic cost to end
                this.f = g + h; // Total cost
                this.parent = parent;
            }
        }

        // Heuristic function (Manhattan distance)
        const heuristic = (x, y) => Math.abs(x - endX) + Math.abs(y - endY);

        // Initialize open and closed sets
        const openSet = [];
        const closedSet = new Set();

        // Create the start node and add it to openSet
        openSet.push(new Node(startX, startY, 0, heuristic(startX, startY)));

        while (openSet.length > 0) {
            // Sort openSet by f value and pop the node with the lowest f
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            // If we've reached the end, return true
            if (current.x === endX && current.y === endY) {
                return true;
            }

            // Add current node to closedSet
            closedSet.add(`${current.x},${current.y}`);

            // Explore neighbors (up, down, left, right)
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const neighbor of neighbors) {
                // Check bounds
                if (
                    neighbor.x < 0 || neighbor.x >= this.width ||
                    neighbor.y < 0 || neighbor.y >= this.height
                ) {
                    continue;
                }

                // Check if it's a wall
                if (level[neighbor.y][neighbor.x] === 1) {
                    continue;
                }

                // Check if already evaluated
                if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
                    continue;
                }

                // Calculate tentative g score
                const tentativeG = current.g + 1; // Assuming uniform cost

                // Check if neighbor is already in openSet with a lower g
                const existingNode = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
                if (existingNode && tentativeG >= existingNode.g) {
                    continue;
                }

                // Add neighbor to openSet
                const neighborNode = new Node(
                    neighbor.x,
                    neighbor.y,
                    tentativeG,
                    heuristic(neighbor.x, neighbor.y),
                    current
                );
                openSet.push(neighborNode);
            }
        }

        // If openSet is empty and end was not reached
        return false;
    }

    saveLevel(level) {
        return JSON.stringify(level);
    }

    loadLevel(json) {
        return JSON.parse(json);
    }
}
