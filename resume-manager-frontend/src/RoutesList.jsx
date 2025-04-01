import { Navigate, Route, Routes } from 'react-router-dom';

import Register from './routes/Register.jsx';

// ==================================================

function RoutesList({ registerUser }) {
  return (
    <Routes>
      <Route
        path="/register"
        element={<Register registerUser={registerUser} />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// ==================================================

export default RoutesList;
