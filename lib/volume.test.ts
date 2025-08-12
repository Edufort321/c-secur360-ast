import { describe, it, expect } from 'vitest';
import { calculateVolume } from './volume';

describe('calculateVolume', () => {
  it('calculates volume for rectangular spaces', () => {
    const volume = calculateVolume({
      shape: 'rectangular',
      length: 2,
      width: 3,
      height: 4,
    });
    expect(volume).toBe(24);
  });

  it('calculates volume for cylindrical spaces', () => {
    const volume = calculateVolume({
      shape: 'cylindrical',
      diameter: 4,
      height: 10,
    });
    expect(volume).toBeCloseTo(125.66, 2);
  });

  it('calculates volume for spherical spaces', () => {
    const volume = calculateVolume({
      shape: 'spherical',
      diameter: 2,
    });
    expect(volume).toBeCloseTo(4.19, 2);
  });

  it('applies reduction factor for irregular spaces', () => {
    const volume = calculateVolume({
      shape: 'irregular',
      length: 2,
      width: 3,
      height: 4,
    });
    expect(volume).toBeCloseTo(20.4, 2);
  });
});

