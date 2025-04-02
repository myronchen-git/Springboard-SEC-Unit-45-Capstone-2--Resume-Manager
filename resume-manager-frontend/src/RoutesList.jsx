import { Navigate, Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar.jsx';
import Account from './routes/Account.jsx';
import HomePage from './routes/HomePage.jsx';
import Register from './routes/Register.jsx';
import Signin from './routes/Signin.jsx';

// ==================================================

function RoutesList({ registerUser, signinUser, signoutUser, updateAccount }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/register"
        element={<Register registerUser={registerUser} />}
      />
      <Route path="/signin" element={<Signin signinUser={signinUser} />} />
      <Route element={<NavBar signoutUser={signoutUser} />}>
        <Route
          path="/account"
          element={<Account updateAccount={updateAccount} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// ==================================================

export default RoutesList;
