import { Goblin, Orc, Demon, Vampire } from '../enemy.js';
import { TILE_SIZE } from '../constants.js';

describe('Enemy Classes', () => {
  let mockLevel;
  let mockPlayer;

  beforeEach(() => {
    mockLevel = Array(10).fill().map(() => Array(10).fill(0));
    mockPlayer = {
      x: 100,
      y: 100
    };
  });

  describe('Goblin', () => {
    let goblin;

    beforeEach(() => {
      goblin = new Goblin(50, 50);
    });

    test('constructor sets correct properties', () => {
      expect(goblin.x).toBe(50);
      expect(goblin.y).toBe(50);
      expect(goblin.type).toBe('👹');
      expect(goblin.speed).toBe(3.5);
      expect(goblin.detectionRadius).toBe(4 * TILE_SIZE);
    });
  });

  describe('Orc', () => {
    let orc;

    beforeEach(() => {
      orc = new Orc(50, 50);
    });

    test('constructor sets correct properties', () => {
      expect(orc.x).toBe(50);
      expect(orc.y).toBe(50);
      expect(orc.type).toBe('👿');
      expect(orc.speed).toBe(3);
      expect(orc.detectionRadius).toBe(6 * TILE_SIZE);
    });
  });

  describe('Demon', () => {
    let demon;

    beforeEach(() => {
      demon = new Demon(50, 50);
    });

    test('constructor sets correct properties', () => {
      expect(demon.x).toBe(50);
      expect(demon.y).toBe(50);
      expect(demon.type).toBe('😈');
      expect(demon.speed).toBe(5);
      expect(demon.detectionRadius).toBe(7 * TILE_SIZE);
    });

    test('move includes diagonal movement', () => {
      demon.moveCounter = demon.moveInterval - 1;
      const initialX = demon.x;
      const initialY = demon.y;
      demon.move(mockPlayer, mockLevel);
      expect(demon.x).not.toBe(initialX);
      expect(demon.y).not.toBe(initialY);
    });
  });

  describe('Vampire', () => {
    let vampire;

    beforeEach(() => {
      vampire = new Vampire(50, 50);
    });

    test('constructor sets correct properties', () => {
      expect(vampire.x).toBe(50);
      expect(vampire.y).toBe(50);
      expect(vampire.type).toBe('🧛');
      expect(vampire.speed).toBe(3);
      expect(vampire.detectionRadius).toBe(8 * TILE_SIZE);
    });

    test('move includes avoidance behavior', () => {
      vampire.moveCounter = vampire.moveInterval - 1;
      mockPlayer.x = vampire.x - (vampire.detectionRadius / 2); // Player is within detection range
      mockPlayer.y = vampire.y;
      const initialX = vampire.x;
      const initialY = vampire.y;
      
      // Force movement
      vampire.move(mockPlayer, mockLevel);
      
      // Verify vampire moved in some direction
      expect(vampire.x !== initialX || vampire.y !== initialY).toBe(true);
    });
  });
});