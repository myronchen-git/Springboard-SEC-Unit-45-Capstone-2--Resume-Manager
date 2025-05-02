import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RegisterOrSigninView from '../components/RegisterOrSigninView.jsx';
import { UserContext } from '../contexts.jsx';

// ==================================================

/**
 * Displays and handles the user registration form.
 */
function Register() {
  const initialFormData = {
    username: '',
    password: '',
    repeatedPassword: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState([]);
  const { registerUser } = useContext(UserContext);
  const navigate = useNavigate();

  // --------------------------------------------------

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (formData.password !== formData.repeatedPassword) {
      return setErrorMessages(['Password and repeated password do not match.']);
    }

    const formDataCopy = { ...formData };
    delete formDataCopy.repeatedPassword;

    try {
      await registerUser(formDataCopy);
    } catch (err) {
      return setErrorMessages(err);
    }

    navigate('/document');
  }

  function handleCancel() {
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
      errorMessages={errorMessages}
    />
  );
}

// ==================================================

export default Register;
