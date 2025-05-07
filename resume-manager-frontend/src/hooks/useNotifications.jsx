import { useCallback, useState } from 'react';

// ==================================================

function useNotifications() {
  const [alerts, setAlerts] = useState([]);

  // --------------------------------------------------

  /**
   * Adds a notification, alert, or error message to the list of notifications.
   *
   * @param {String} message - The text to display.
   * @param {String} color - Bootstrap color type (primary, danger).
   */
  const addAlert = useCallback((message, color) => {
    setAlerts((alerts) => [...alerts, { id: Date.now(), message, color }]);
  }, []);

  /**
   * Removes a notification, alert, or error message from the list of
   * notifications.
   *
   * @param {Number} id - The ID of an alert to remove.
   */
  const removeAlert = useCallback((id) => {
    setAlerts((alerts) => alerts.filter((alert) => alert.id !== id));
  }, []);

  /**
   * Clears all notifications, alerts, or error messages.
   */
  const clearAlerts = useCallback(() => setAlerts([]), []);

  return { alerts, addAlert, removeAlert, clearAlerts };
}

// ==================================================

export default useNotifications;
