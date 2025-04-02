import { Navigate, Route, Routes } from 'react-router-dom';

import Account from './routes/Account.jsx';
import Register from './routes/Register.jsx';
import Signin from './routes/Signin.jsx';

// ==================================================

function RoutesList({ registerUser, signinUser, updateAccount }) {
  return (
    <Routes>
      <Route
        path="/register"
        element={<Register registerUser={registerUser} />}
      />
      <Route path="/signin" element={<Signin signinUser={signinUser} />} />
      <Route
        path="/account"
        element={<Account updateAccount={updateAccount} />}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// ==================================================

export default RoutesList;
