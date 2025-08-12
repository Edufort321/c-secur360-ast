import { steps } from '../stepsConfig';

describe('stepsConfig', () => {
  it('defines six steps', () => {
    expect(steps).toHaveLength(6);
  });
});
