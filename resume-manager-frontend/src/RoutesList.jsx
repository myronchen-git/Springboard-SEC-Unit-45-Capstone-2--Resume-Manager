import { Navigate, Route, Routes } from 'react-router-dom';

import NavBar from './components/NavBar/NavBar.jsx';
import Account from './routes/Account/Account.jsx';
import Document from './routes/Document/Document.jsx';
import HomePage from './routes/HomePage/HomePage.jsx';
import Register from './routes/Register/Register.jsx';
import Signin from './routes/Signin/Signin.jsx';
import RouteProtector from './routes/middleware/RouteProtector.jsx';

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
