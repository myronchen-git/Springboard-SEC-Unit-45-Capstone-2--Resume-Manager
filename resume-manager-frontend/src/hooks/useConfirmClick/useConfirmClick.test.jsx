import { act, renderHook } from '@testing-library/react';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import useConfirmClick from './useConfirmClick.jsx';

// ==================================================

describe('useConfirmClick', () => {
  const mockFunction = vi.fn();

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('initiates with no clicks registered.', () => {
    // Act
    const { result } = renderHook(() => useConfirmClick(mockFunction));
    const [clickedOnce, handleClick] = result.current;

    // Assert
    expect(clickedOnce).toBe(false);
    expect(handleClick).toEqual(expect.any(Function));
  });

  it(
    'registers a click after clicking once, but does not execute ' +
      'the passed-in function.',
    async () => {
      // Arrange
      const { result } = renderHook(() => useConfirmClick(mockFunction));
      const [, handleClick] = result.current;

      // Act
      await act(handleClick);
      await act(() => vi.advanceTimersByTime(10));

      // Assert
      const [clickedOnce] = result.current;

      expect(clickedOnce).toBe(true);
      expect(mockFunction).not.toHaveBeenCalled();
    }
  );

  it('expires a click if not clicked a second time within the alloted time.', async () => {
    // Arrange
    const { result } = renderHook(() => useConfirmClick(mockFunction));
    const [, handleClick] = result.current;

    // Act
    await act(handleClick);
    await act(vi.runAllTimers);

    // Assert
    const [clickedOnce] = result.current;

    expect(clickedOnce).toBe(false);
    expect(mockFunction).not.toHaveBeenCalled();
  });

  it('executes the the passed-in function if clicked twice within alloted time.', async () => {
    // Arrange
    const { result } = renderHook(() => useConfirmClick(mockFunction));

    // Act
    // result.current[1] is handleClick.
    await act(result.current[1]);
    await act(result.current[1]);

    // Assert
    expect(mockFunction).toHaveBeenCalled();
  });
});
