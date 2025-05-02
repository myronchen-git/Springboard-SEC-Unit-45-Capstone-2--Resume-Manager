import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RegisterOrSigninView from '../components/RegisterOrSigninView.jsx';
import { UserContext } from '../contexts.jsx';

// ==================================================

/**
 * Displays and handles the user sign-in form.
 */
function Signin() {
  const initialFormData = {
    username: '',
    password: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState([]);
  const { signinUser } = useContext(UserContext);
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
      setErrorMessages(err);
      return;
    }

    navigate('/document');
  }

  function handleCancel() {
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
      errorMessages={errorMessages}
    />
  );
}

// ==================================================

export default Signin;
