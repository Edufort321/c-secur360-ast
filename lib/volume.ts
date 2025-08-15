export interface RectangularDimensions {
  shape: 'rectangular';
  length: number;
  width: number;
  height: number;
}

export interface CylindricalDimensions {
  shape: 'cylindrical';
  diameter: number;
  height: number;
}

export interface SphericalDimensions {
  shape: 'spherical';
  diameter: number;
}

export interface IrregularDimensions {
  shape: 'irregular';
  length: number;
  width: number;
  height: number;
}

export type Dimensions =
  | RectangularDimensions
  | CylindricalDimensions
  | SphericalDimensions
  | IrregularDimensions;

/**
 * Calculate the volume of a confined space based on its shape and dimensions.
 * Accepts a discriminated union of shape-specific dimension interfaces.
 * Returns the volume rounded to two decimals.
 */
export function calculateVolume(dimensions: Dimensions): number {
  let volume = 0;

  switch (dimensions.shape) {
    case 'rectangular':
      if (
        dimensions.length > 0 &&
        dimensions.width > 0 &&
        dimensions.height > 0
      ) {
        volume = dimensions.length * dimensions.width * dimensions.height;
      }
      break;
    case 'cylindrical':
      if (dimensions.diameter > 0 && dimensions.height > 0) {
        const radius = dimensions.diameter / 2;
        volume = Math.PI * Math.pow(radius, 2) * dimensions.height;
      }
      break;
    case 'spherical':
      if (dimensions.diameter > 0) {
        const radius = dimensions.diameter / 2;
        volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
      }
      break;
    case 'irregular':
      if (
        dimensions.length > 0 &&
        dimensions.width > 0 &&
        dimensions.height > 0
      ) {
        volume =
          dimensions.length * dimensions.width * dimensions.height * 0.85;
      }
      break;
  }

  return Math.round(volume * 100) / 100;
}

