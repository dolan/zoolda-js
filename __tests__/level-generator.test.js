import LevelGenerator from '../level-generator.js';
import { WALL_TILE_IDS, BULLET_TILE_ID, CRYSTAL_TILE_ID } from '../constants.js';

describe('LevelGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new LevelGenerator(10, 10); // Use smaller size for tests
  });

  test('constructor sets initial properties', () => {
    expect(generator.width).toBe(10);
    expect(generator.height).toBe(10);
    expect(generator.requiredCrystals).toBe(0);
  });

  test('generateLevel creates valid level structure', () => {
    const { level, startX, startY, endX, endY, enemies, requiredCrystals } = generator.generateLevel();
    
    expect(Array.isArray(level)).toBe(true);
    expect(level.length).toBe(generator.height);
    expect(level[0].length).toBe(generator.width);
    
    expect(typeof startX).toBe('number');
    expect(typeof startY).toBe('number');
    expect(typeof endX).toBe('number');
    expect(typeof endY).toBe('number');
    
    expect(Array.isArray(enemies)).toBe(true);
    expect(typeof requiredCrystals).toBe('number');
  });

  test('hasPathAStar finds valid path', () => {
    const simpleLevel = Array(10).fill().map(() => Array(10).fill(0));
    const hasPath = generator.hasPathAStar(simpleLevel, 1, 1, 3, 3);
    expect(hasPath).toBe(true);
  });

  test('hasPathAStar returns false for blocked path', () => {
    const blockedLevel = Array(10).fill().map(() => Array(10).fill(0));
    // Create a complete horizontal wall in the middle
    for (let x = 0; x < 10; x++) {
      blockedLevel[5][x] = WALL_TILE_IDS[0];
    }
    const hasPath = generator.hasPathAStar(blockedLevel, 1, 1, 1, 8);
    expect(hasPath).toBe(false);
  });

  test('saveLevel and loadLevel maintain level structure', () => {
    const originalLevel = [[0, 1], [1, 0]];
    const saved = generator.saveLevel(originalLevel);
    const loaded = generator.loadLevel(saved);
    expect(loaded).toEqual(originalLevel);
  });
});
