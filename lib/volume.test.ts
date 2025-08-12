import { describe, it, expect } from 'vitest';
import { calculateVolume } from './volume';

describe('calculateVolume', () => {
  it('calculates volume for rectangular spaces', () => {
    const volume = calculateVolume('rectangular', {
      length: 2,
      width: 3,
      height: 4,
      diameter: 0,
    });
    expect(volume).toBe(24);
  });

  it('calculates volume for cylindrical spaces', () => {
    const volume = calculateVolume('cylindrical', {
      length: 0,
      width: 0,
      height: 10,
      diameter: 4,
    });
    expect(volume).toBeCloseTo(125.66, 2);
  });

  it('calculates volume for spherical spaces', () => {
    const volume = calculateVolume('spherical', {
      length: 0,
      width: 0,
      height: 0,
      diameter: 2,
    });
    expect(volume).toBeCloseTo(4.19, 2);
  });

  it('applies reduction factor for irregular spaces', () => {
    const volume = calculateVolume('irregular', {
      length: 2,
      width: 3,
      height: 4,
      diameter: 0,
    });
    expect(volume).toBeCloseTo(20.4, 2);
  });
});

