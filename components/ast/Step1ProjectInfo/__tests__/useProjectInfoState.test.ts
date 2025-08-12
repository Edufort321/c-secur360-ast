import { renderHook } from '@testing-library/react';
import { useProjectInfoState } from '../useProjectInfoState';

describe('useProjectInfoState', () => {
  it('initializes with default data', () => {
    const { result } = renderHook(() =>
      useProjectInfoState({
        formData: {},
        projectInfo: {},
        workLocations: [],
        lockoutPoints: [],
        lockoutPhotos: [],
      })
    );
    expect(result.current.localData.client).toBe('');
    expect(result.current.astNumber).toBeTruthy();
  });
});
