import { generateASTNumber } from '../helpers';

describe('generateASTNumber', () => {
  it('generates unique numbers', () => {
    const a = generateASTNumber();
    const b = generateASTNumber();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^AST-/);
  });
});
