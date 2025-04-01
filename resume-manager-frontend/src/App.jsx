import { useState } from 'react';

import ResumeManagerApi from './api.js';
import RoutesList from './RoutesList.jsx';

import './App.css';

// ==================================================

/**
 * The core app component.  This contains shared data and functions.
 */
function App() {
  const [authToken, setAuthToken] = useState(null);

  /**
   * Registers a new user.
   *
   * @param {Object} formData - Holds the data for creating a new user.
   * @param {String} formData.username - Name of the new user.
   * @param {String} formData.password - Password for the user.
   */
  async function registerUser(formData) {
    const authToken = await ResumeManagerApi.registerUser(formData);
    setAuthToken(authToken);
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
    setAuthToken(authToken);
  }

  return (
    <div className="App">
      <RoutesList registerUser={registerUser} signinUser={signinUser} />
    </div>
  );
}

// ==================================================

export default App;
