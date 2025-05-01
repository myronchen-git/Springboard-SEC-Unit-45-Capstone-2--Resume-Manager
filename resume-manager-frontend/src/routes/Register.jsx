import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

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
    <main className="Register">
      <Card>
        <CardBody>
          <CardTitle tag={'h2'}>Register</CardTitle>
          <Form className="Register__form" onSubmit={handleSubmit}>
            <FormGroup className="text-start">
              <Label htmlFor="Register__input-username">
                <b>Username</b>
              </Label>
              <Input
                id="Register__input-username"
                type="text"
                name="username"
                value={formData.username}
                required
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup className="text-start">
              <Label htmlFor="Register__input-password">
                <b>Password</b>
              </Label>
              <Input
                id="Register__input-password"
                type="password"
                name="password"
                value={formData.password}
                required
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup className="text-start">
              <Label htmlFor="Register__input-repeated-password">
                <b>Repeat Password</b>
              </Label>
              <Input
                id="Register__input-repeated-password"
                type="password"
                name="repeatedPassword"
                value={formData.repeatedPassword}
                required
                onChange={handleChange}
              />
            </FormGroup>
            {errorMessages.map((msg) => (
              <Alert key={msg} color="danger">
                {msg}
              </Alert>
            ))}
            <Button color="primary" type="submit">
              Submit
            </Button>
            <Button color="primary" type="button" onClick={handleCancel}>
              Cancel
            </Button>
          </Form>
        </CardBody>
      </Card>
    </main>
  );
}

// ==================================================

export default Register;
