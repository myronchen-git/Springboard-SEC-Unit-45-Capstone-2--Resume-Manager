import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useNotifications from './useNotifications.jsx';

// ==================================================

describe('useNotifications', () => {
  const message = 'message';
  const color = 'primary';

  it('adds an alert.', async () => {
    // Arrange
    const { result } = renderHook(() => useNotifications());

    // Act
    const { addAlert } = result.current;
    await act(async () => await addAlert(message, color));

    // Assert
    const { alerts } = result.current;
    expect(alerts).toStrictEqual([{ id: expect.any(Number), message, color }]);
  });

  it('removes an alert.', async () => {
    // Arrange
    const { result } = renderHook(() => useNotifications());

    const { addAlert } = result.current;
    // Add 3 alerts.
    for (let i = 0; i < 3; i++) {
      await act(async () => await addAlert(message, color));
    }

    let { alerts } = result.current;
    const secondAlertId = alerts[1].id;

    // Act
    const { removeAlert } = result.current;
    await act(async () => await removeAlert(secondAlertId));

    // Assert
    ({ alerts } = result.current);
    expect(alerts).toHaveLength(2);
    expect(alerts).not.toContainEqual(
      expect.objectContaining({ id: secondAlertId })
    );
  });

  it('clears all alerts.', async () => {
    // Arrange
    const { result } = renderHook(() => useNotifications());

    const { addAlert } = result.current;
    // Add 2 alerts.
    for (let i = 0; i < 2; i++) {
      await act(async () => await addAlert(message, color));
    }

    // Act
    const { clearAlerts } = result.current;
    await act(async () => await clearAlerts());

    // Assert
    const { alerts } = result.current;
    expect(alerts).toStrictEqual([]);
  });
});
