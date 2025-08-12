/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBodyScrollLock } from '../useBodyScrollLock';

describe('useBodyScrollLock', () => {
  it('toggles body classes based on state', () => {
    const { rerender } = renderHook((props: boolean) => useBodyScrollLock(props), {
      initialProps: false,
    });
    expect(document.body.classList.contains('modal-open')).toBe(false);
    rerender(true);
    expect(document.body.classList.contains('modal-open')).toBe(true);
    rerender(false);
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });
});
