export type SpaceShape =
  | 'rectangular'
  | 'cylindrical'
  | 'spherical'
  | 'irregular';

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  diameter: number;
}

/**
 * Calculate the volume of a confined space based on its shape and dimensions.
 * Returns the volume rounded to two decimals.
 */
export function calculateVolume(
  shape: SpaceShape,
  { length, width, height, diameter }: Dimensions
): number {
  let volume = 0;

  switch (shape) {
    case 'rectangular':
      if (length > 0 && width > 0 && height > 0) {
        volume = length * width * height;
      }
      break;
    case 'cylindrical':
      if (diameter > 0 && height > 0) {
        const radius = diameter / 2;
        volume = Math.PI * Math.pow(radius, 2) * height;
      }
      break;
    case 'spherical':
      if (diameter > 0) {
        const radius = diameter / 2;
        volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
      }
      break;
    case 'irregular':
      if (length > 0 && width > 0 && height > 0) {
        volume = length * width * height * 0.85;
      }
      break;
  }

  return Math.round(volume * 100) / 100;
}

