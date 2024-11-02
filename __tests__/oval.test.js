import Oval from '../oval.js';

describe('Oval', () => {
  let oval;

  beforeEach(() => {
    oval = new Oval(10, 10, 20, 20, true, 0.7);
  });

  test('constructor sets properties correctly', () => {
    expect(oval.x).toBe(10);
    expect(oval.y).toBe(10);
    expect(oval.width).toBe(20);
    expect(oval.height).toBe(20);
    expect(oval.isWalkable).toBe(true);
    expect(oval.fillRate).toBe(0.7);
  });

  test('isInside returns boolean based on point location and fillRate', () => {
    // Center point should always be inside
    const centerX = oval.x + oval.width / 2;
    const centerY = oval.y + oval.height / 2;
    
    // Mock Math.random to always return 0.5
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.5;
    global.Math = mockMath;

    expect(oval.isInside(centerX, centerY)).toBe(true);

    // Point far outside should be false
    expect(oval.isInside(oval.x + oval.width * 2, oval.y + oval.height * 2)).toBe(false);
  });
});
