import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { UserContext } from '../../contexts.jsx';

// ==================================================

/**
 * Middleware for protecting routes against users who are not logged in.
 */
function RouteProtector() {
  const { user } = useContext(UserContext);
  return user?.username ? <Outlet /> : <Navigate to="/" />;
}

// ==================================================

export default RouteProtector;
