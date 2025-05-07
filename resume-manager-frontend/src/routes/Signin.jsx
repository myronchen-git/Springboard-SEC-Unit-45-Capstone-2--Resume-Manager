import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RegisterOrSigninView from '../components/RegisterOrSigninView.jsx';
import { AppContext, UserContext } from '../contexts.jsx';

// ==================================================

/**
 * Displays and handles the user sign-in form.
 */
function Signin() {
  const { addAlert, clearAlerts } = useContext(AppContext);
  const { signinUser } = useContext(UserContext);

  const initialFormData = {
    username: '',
    password: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const navigate = useNavigate();

  // --------------------------------------------------

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await signinUser(formData);
    } catch (err) {
      return err.forEach((message) => addAlert(message, 'danger'));
    }

    clearAlerts();
    navigate('/document');
  }

  function handleCancel() {
    clearAlerts();
    navigate('/');
  }

  // --------------------------------------------------

  return (
    <RegisterOrSigninView
      name="Signin"
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
    />
  );
}

// ==================================================

export default Signin;
