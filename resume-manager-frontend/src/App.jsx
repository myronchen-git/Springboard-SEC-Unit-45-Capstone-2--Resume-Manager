import { jwtDecode } from 'jwt-decode';
import { useCallback, useMemo, useState } from 'react';

import ResumeManagerApi from './api.js';
import { UserContext } from './contexts.jsx';
import RoutesList from './RoutesList.jsx';

import './App.css';

// ==================================================

/**
 * The core app component.  This contains shared data and functions.
 */
function App() {
  const [user, setUser] = useState(
    ResumeManagerApi.authToken ? jwtDecode(ResumeManagerApi.authToken) : {}
  );

  // --------------------------------------------------

  /**
   * Registers a new user.
   *
   * @param {Object} formData - Holds the data for creating a new user.
   * @param {String} formData.username - Name of the new user.
   * @param {String} formData.password - Password for the user.
   */
  const registerUser = useCallback(async (formData) => {
    setUser(await ResumeManagerApi.registerUser(formData));
  }, []);

  /**
   * Signs in a user.
   *
   * @param {Object} formData - Holds the data for signing in a user.
   * @param {String} formData.username - Name of the user.
   * @param {String} formData.password - Password of the user.
   */
  const signinUser = useCallback(async (formData) => {
    setUser(await ResumeManagerApi.signinUser(formData));
  }, []);

  /**
   * Signs out a user.
   */
  const signoutUser = useCallback(async () => {
    ResumeManagerApi.authToken = null;
    setUser({});
  }, []);

  /**
   * Updates a user's account information, such as password.
   *
   * @param {Object} formData - Holds the data for updating account info.
   * @see ResumeManagerApi.updateAccount for formData properties.
   */
  const updateAccount = useCallback(
    async (formData) => {
      const userData = await ResumeManagerApi.updateAccount(formData);
      setUser({ ...user, ...userData });
    },
    [user]
  );

  // --------------------------------------------------

  const userContextValues = useMemo(
    () => ({
      user,
      registerUser,
      signinUser,
      signoutUser,
      updateAccount,
    }),
    [user, registerUser, signinUser, signoutUser, updateAccount]
  );

  // --------------------------------------------------

  return (
    <UserContext.Provider value={userContextValues}>
      <RoutesList />
    </UserContext.Provider>
  );
}

// ==================================================

export default App;
