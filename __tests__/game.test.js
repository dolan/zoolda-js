import Game from '../game.js';

describe('Game', () => {
  let game;
  let mockCanvas;
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      clearRect: jest.fn(),
      fillText: jest.fn(),
      font: '',
      measureText: jest.fn().mockReturnValue({ width: 100 })
    };
    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockCtx),
      width: 1000,
      height: 800
    };
    game = new Game(mockCanvas);
  });

  test('constructor initializes game state', () => {
    expect(game.canvas).toBe(mockCanvas);
    expect(game.ctx).toBe(mockCtx);
    expect(game.gameActive).toBe(true);
    expect(Array.isArray(game.bullets)).toBe(true);
    expect(game.exitOpen).toBe(false);
    expect(Array.isArray(game.monsterPositions)).toBe(true);
  });

  test('movePlayer handles collision detection', () => {
    const initialX = game.player.x;
    const initialY = game.player.y;
    
    // Mock collision
    game.isCollisionWithWall = jest.fn().mockReturnValue(true);
    game.movePlayer(10, 0);
    expect(game.player.x).toBe(initialX);
    expect(game.player.y).toBe(initialY);
    
    // Mock no collision
    game.isCollisionWithWall = jest.fn().mockReturnValue(false);
    game.movePlayer(10, 0);
    expect(game.player.x).toBe(initialX + 10);
    expect(game.player.y).toBe(initialY);
  });

  test('showMessage sets message with timeout', () => {
    jest.useFakeTimers();
    game.showMessage('test message', 1000);
    expect(game.message).toBe('test message');
    jest.advanceTimersByTime(1000);
    expect(game.message).toBeNull();
    jest.useRealTimers();
  });

  test('gameOver sets game state correctly', () => {
    jest.useFakeTimers();
    game.gameOver();
    expect(game.gameActive).toBe(false);
    expect(game.message).toBeTruthy();
    jest.advanceTimersByTime(3000);
    expect(game.gameActive).toBe(true);
    jest.useRealTimers();
  });

  test('checkExit handles exit conditions', () => {
    game.level = Array(20).fill().map(() => Array(30).fill(0));
    const playerTileX = Math.floor(game.player.x / 32);
    const playerTileY = Math.floor(game.player.y / 32);
    game.level[playerTileY][playerTileX] = 17; // Exit tile

    game.checkExit();
    expect(game.message).toContain('crystals');

    game.exitOpen = true;
    game.checkExit();
    expect(game.gameActive).toBe(false);
    expect(game.message).toContain('win');
  });
});
