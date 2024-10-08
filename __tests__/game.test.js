import { movePlayer, collectCrystal } from '../game.js';

describe('Game', () => {
  test('player can move', () => {
    const result = movePlayer('right');
    expect(result).toBe(true);
  });

  test('crystals can be collected', () => {
    const player = { x: 0, y: 0 };
    const crystal = { x: 0, y: 0 };
    const result = collectCrystal(player, crystal);
    expect(result).toBe(true);
  });
});
