import { Alert } from 'reactstrap';

import './Notifications.css';

// ==================================================

function Notifications({ alerts, removeAlert }) {
  return (
    <aside id="Notifications">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          color={alert.color}
          toggle={() => removeAlert(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
    </aside>
  );
}

// ==================================================

export default Notifications;
