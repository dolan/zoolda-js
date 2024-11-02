import Player from '../player.js';
import { TILE_SIZE } from '../constants.js';

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player(100, 100);
  });

  test('constructor sets initial properties', () => {
    expect(player.x).toBe(100);
    expect(player.y).toBe(100);
    expect(player.width).toBe(TILE_SIZE);
    expect(player.height).toBe(TILE_SIZE);
    expect(player.icon).toBe('🧙');
    expect(player.speed).toBe(5);
    expect(player.bullets).toBe(0);
    expect(player.facing).toBe('right');
    expect(player.crystals).toBe(0);
  });

  test('move updates position and facing direction', () => {
    player.move(10, 0);
    expect(player.x).toBe(110);
    expect(player.y).toBe(100);
    expect(player.facing).toBe('right');

    player.move(-10, 0);
    expect(player.x).toBe(100);
    expect(player.facing).toBe('left');

    player.move(0, 10);
    expect(player.y).toBe(110);
    expect(player.facing).toBe('down');

    player.move(0, -10);
    expect(player.y).toBe(100);
    expect(player.facing).toBe('up');
  });

  test('draw calls context fillText with correct parameters', () => {
    const mockCtx = {
      fillText: jest.fn()
    };
    player.draw(mockCtx);
    expect(mockCtx.fillText).toHaveBeenCalledWith('🧙', player.x, player.y + TILE_SIZE);
  });

  test('collectBullet increases bullet count', () => {
    player.collectBullet();
    expect(player.bullets).toBe(1);
  });

  test('collectCrystal increases crystal count', () => {
    player.collectCrystal();
    expect(player.crystals).toBe(1);
  });

  test('shoot creates bullet when bullets available', () => {
    player.bullets = 1;
    player.direction = 'right';
    const bullet = player.shoot();
    expect(bullet).not.toBeNull();
    expect(player.bullets).toBe(0);
  });

  test('shoot returns null when no bullets available', () => {
    player.bullets = 0;
    const bullet = player.shoot();
    expect(bullet).toBeNull();
  });
});
