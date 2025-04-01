import { Navigate, Route, Routes } from 'react-router-dom';

import Register from './routes/Register.jsx';
import Signin from './routes/Signin.jsx';

// ==================================================

function RoutesList({ registerUser, signinUser }) {
  return (
    <Routes>
      <Route
        path="/register"
        element={<Register registerUser={registerUser} />}
      />
      <Route path="/signin" element={<Signin signinUser={signinUser} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// ==================================================

export default RoutesList;
