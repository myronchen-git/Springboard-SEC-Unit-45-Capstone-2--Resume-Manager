import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

import ResumeManagerApi from './api.js';
import RoutesList from './RoutesList.jsx';

import './App.css';

// ==================================================

/**
 * The core app component.  This contains shared data and functions.
 */
function App() {
  const [user, setUser] = useState({});

  /**
   * Registers a new user.
   *
   * @param {Object} formData - Holds the data for creating a new user.
   * @param {String} formData.username - Name of the new user.
   * @param {String} formData.password - Password for the user.
   */
  async function registerUser(formData) {
    const authToken = await ResumeManagerApi.registerUser(formData);
    const userData = jwtDecode(authToken);
    setUser({ ...userData, authToken });
  }

  /**
   * Signs in a user.
   *
   * @param {Object} formData - Holds the data for signing in a user.
   * @param {String} formData.username - Name of the user.
   * @param {String} formData.password - Password of the user.
   */
  async function signinUser(formData) {
    const authToken = await ResumeManagerApi.signinUser(formData);
    const userData = jwtDecode(authToken);
    setUser({ ...userData, authToken });
  }

  /**
   * Signs out a user.
   */
  async function signoutUser() {
    ResumeManagerApi.authToken = null;
  }

  /**
   * Updates a user's account information, such as password.
   *
   * @param {Object} formData - Holds the data for updating account info.
   * @see ResumeManagerApi.updateAccount for formData properties.
   */
  async function updateAccount(formData) {
    const userData = await ResumeManagerApi.updateAccount(
      user.username,
      formData
    );
    setUser({ ...user, ...userData });
  }

  return (
    <div className="App">
      <RoutesList
        registerUser={registerUser}
        signinUser={signinUser}
        signoutUser={signoutUser}
        updateAccount={updateAccount}
        username={user.username}
      />
    </div>
  );
}

// ==================================================

export default App;
