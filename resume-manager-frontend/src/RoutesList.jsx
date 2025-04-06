import { Navigate, Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar.jsx';
import Account from './routes/Account.jsx';
import Document from './routes/Document.jsx';
import HomePage from './routes/HomePage.jsx';
import Register from './routes/Register.jsx';
import Signin from './routes/Signin.jsx';
import RouteProtector from './routes/middleware/routeProtector.jsx';

// ==================================================

function RoutesList() {
  return (
    <Routes>
      <Route element={<RouteProtector />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<Signin />} />
        <Route element={<NavBar />}>
          <Route path="/account" element={<Account />} />
          <Route path="/document" element={<Document />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

// ==================================================

export default RoutesList;
