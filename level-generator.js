// level-generator.js
import { WALL_TILE_IDS, BULLET_TILE_ID, CRYSTAL_TILE_ID, TILE_SIZE } from './constants.js';

class Oval {
  constructor(x, y, width, height, isWalkable, fillRate = 0.7) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isWalkable = isWalkable;
    this.fillRate = fillRate;
  }

  isInside(x, y) {
    const normalizedX = (x - this.x - this.width / 2) / (this.width / 2);
    const normalizedY = (y - this.y - this.height / 2) / (this.height / 2);
    return (normalizedX * normalizedX + normalizedY * normalizedY <= 1) && Math.random() < this.fillRate;
  }
}

function generateLevel(width, height) {
  const level = [];
  const masks = [
    new Oval(0, 0, 10, 10, false), // Non-walkable oval at 0,0 with size 10x10
    new Oval(15, 15, 20, 20, true, 0.9), // Walkable oval at 15,15 with size 20x20 and higher fill rate
    new Oval(40, 5, 15, 30, false, 0.6), // Non-walkable oval at 40,5 with size 15x30 and lower fill rate
    // Add more masks as needed
  ];

  // First phase: Generate non-walkable areas
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let isNonWalkable = false;
      for (const mask of masks) {
        if (!mask.isWalkable && mask.isInside(x, y)) {
          isNonWalkable = true;
          break;
        }
      }
      row.push(isNonWalkable ? 1 : null);
    }
    level.push(row);
  }

  // Second phase: Generate walkable areas
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (level[y][x] === null) {
        let isWalkable = false;
        for (const mask of masks) {
          if (mask.isWalkable && mask.isInside(x, y)) {
            isWalkable = true;
            break;
          }
        }
        level[y][x] = isWalkable ? 0 : (Math.random() < 0.8 ? 0 : 1);
      }
    }
  }

  // Third phase: Populate enemies and items
  // ... existing enemy and item placement code ...

  return level;
}

export default class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.requiredCrystals = 0;
    }

    generateLevel() {
        let level, startX, startY, endX, endY, enemies;
        let isPathValid = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!isPathValid && attempts < maxAttempts) {
            level = this.generateComplexLevel();
            ({ startX, startY, endX, endY } = this.placeStartAndEnd(level));
            enemies = this.placeEnemies(level, startX, startY, endX, endY);
            this.placeBullets(level, startX, startY, endX, endY);
            this.placeCrystals(level, startX, startY, endX, endY);

            // Check if there's a valid path from start to end
            isPathValid = this.hasPathAStar(level, startX, startY, endX, endY);
            attempts++;
        }

        if (!isPathValid) {
            console.error('Failed to generate a valid level after maximum attempts');
            // Generate a simpler level as a fallback
            level = this.generateSimpleFallbackLevel();
            startX = 1;
            startY = 1;
            endX = this.width - 2;
            endY = this.height - 2;
            this.placeCrystals(level, startX, startY, endX, endY);
        }

        return { level, startX, startY, endX, endY, enemies, requiredCrystals: this.requiredCrystals };
    }

    generateComplexLevel() {
        const level = [];
        for (let y = 0; y < this.height; y++) {
            level[y] = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                    // Place walls around the edges
                    level[y][x] = WALL_TILE_IDS[Math.floor(Math.random() * WALL_TILE_IDS.length)];
                } else {
                    // Randomly place obstacles (trees, rocks) or empty spaces
                    level[y][x] = Math.random() < 0.2 ? WALL_TILE_IDS[Math.floor(Math.random() * WALL_TILE_IDS.length)] : 0;
                }
            }
        }
        return level;
    }

    placeStartAndEnd(level) {
        let startX, startY, endX, endY;
        do {
            startX = Math.floor(Math.random() * (this.width - 2)) + 1;
            startY = Math.floor(Math.random() * (this.height - 2)) + 1;
            endX = Math.floor(Math.random() * (this.width - 2)) + 1;
            endY = Math.floor(Math.random() * (this.height - 2)) + 1;
        } while (startX === endX && startY === endY || level[startY][startX] !== 0 || level[endY][endX] !== 0);
        
        level[startY][startX] = 0; // Ensure start is empty
        level[endY][endX] = 17; // Use a specific tile for the exit (e.g., 17)
        return { startX, startY, endX, endY };
    }

    placeEnemies(level, startX, startY, endX, endY) {
        let numEnemies = Math.floor(Math.random() * 5) + 1; // 1-5 enemies
        const enemyTypes = [18, 19, 20, 21]; // Goblin, Orc, Demon, Vampire
        let enemies = [];
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
        return enemies;
    }

    placeBullets(level, startX, startY, endX, endY) {
        let numBullets = Math.floor(Math.random() * 5) + 1; // 1-5 bullets
        for (let i = 0; i < numBullets; i++) {
            let bulletX, bulletY;
            do {
                bulletX = Math.floor(Math.random() * this.width);
                bulletY = Math.floor(Math.random() * this.height);
            } while (
                level[bulletY][bulletX] !== 0 || 
                (bulletX === startX && bulletY === startY) || 
                (bulletX === endX && bulletY === endY)
            );
            level[bulletY][bulletX] = BULLET_TILE_ID;
        }
    }

    placeCrystals(level, startX, startY, endX, endY) {
        // Calculate a reasonable number of required crystals based on level size
        const levelArea = this.width * this.height;
        const baseCrystals = 3; // Minimum number of crystals
        const maxAdditionalCrystals = Math.floor(levelArea / (10 * TILE_SIZE)); // Scale with level size
        this.requiredCrystals = baseCrystals + Math.floor(Math.random() * (maxAdditionalCrystals + 1));

        console.log(`Generating ${this.requiredCrystals} crystals`);

        for (let i = 0; i < this.requiredCrystals; i++) {
            let crystalX, crystalY;
            do {
                crystalX = Math.floor(Math.random() * this.width);
                crystalY = Math.floor(Math.random() * this.height);
            } while (
                level[crystalY][crystalX] !== 0 || 
                (crystalX === startX && crystalY === startY) || 
                (crystalX === endX && crystalY === endY)
            );
            level[crystalY][crystalX] = CRYSTAL_TILE_ID;
        }
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
