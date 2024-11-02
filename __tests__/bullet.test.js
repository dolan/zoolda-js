import Bullet from '../bullet.js';
import { jest } from '@jest/globals';

describe('Bullet', () => {
  let bullet;
  let mockCtx;

  beforeEach(() => {
    bullet = new Bullet(100, 100, 'right');
    mockCtx = {
      fillStyle: '',
      fillRect: jest.fn()
    };
  });

  test('constructor sets initial properties', () => {
    expect(bullet.x).toBe(100);
    expect(bullet.y).toBe(100);
    expect(bullet.direction).toBe('right');
    expect(bullet.speed).toBe(9);
    expect(bullet.width).toBe(9);
    expect(bullet.height).toBe(9);
  });

  test('move updates position based on direction', () => {
    bullet.move();
    expect(bullet.x).toBe(109); // 100 + speed(9) for right direction
    expect(bullet.y).toBe(100);

    bullet.direction = 'left';
    bullet.move();
    expect(bullet.x).toBe(100); // 109 - speed(9) for left direction

    bullet.direction = 'up';
    bullet.move();
    expect(bullet.y).toBe(91); // 100 - speed(9) for up direction

    bullet.direction = 'down';
    bullet.move();
    expect(bullet.y).toBe(100); // 91 + speed(9) for down direction
  });

  test('draw calls context methods with correct parameters', () => {
    bullet.draw(mockCtx);
    expect(mockCtx.fillStyle).toBe('red');
    expect(mockCtx.fillRect).toHaveBeenCalledWith(bullet.x, bullet.y, bullet.width, bullet.height);
  });
});
