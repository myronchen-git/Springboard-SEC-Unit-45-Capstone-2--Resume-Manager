import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { UserContext } from '../../contexts.jsx';

// ==================================================

/**
 * Middleware for protecting routes against users who are and are not logged in.
 */
function RouteProtector() {
  const location = useLocation();
  const { user } = useContext(UserContext);

  const urlPath = location.pathname.toLowerCase();

  if (user?.username) {
    // If logged in.

    const urlsToAvoid = ['/register', '/signin'];

    if (urlPath === '/' || urlsToAvoid.some((url) => urlPath.startsWith(url))) {
      return <Navigate to="/document" />;
    }
  } else {
    // If not logged in.

    const urlsToAvoid = ['/document', '/account'];

    if (urlsToAvoid.some((url) => urlPath.startsWith(url))) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
}

// ==================================================

export default RouteProtector;
