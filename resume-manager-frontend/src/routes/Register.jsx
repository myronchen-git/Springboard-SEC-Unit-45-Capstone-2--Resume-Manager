import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RegisterOrSigninView from '../components/RegisterOrSigninView.jsx';
import { AppContext, UserContext } from '../contexts.jsx';

// ==================================================

/**
 * Displays and handles the user registration form.
 */
function Register() {
  const { addAlert, clearAlerts } = useContext(AppContext);
  const { registerUser } = useContext(UserContext);

  const initialFormData = {
    username: '',
    password: '',
    repeatedPassword: '',
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

    if (formData.password !== formData.repeatedPassword) {
      return addAlert('Password and repeated password do not match.', 'danger');
    }

    const formDataCopy = { ...formData };
    delete formDataCopy.repeatedPassword;

    try {
      await registerUser(formDataCopy);
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
      name="Register"
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
    />
  );
}

// ==================================================

export default Register;
