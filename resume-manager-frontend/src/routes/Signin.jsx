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
    <main className="Signin">
      <Card>
        <CardBody>
          <CardTitle tag={'h2'}>Signin</CardTitle>
          <Form className="Signin__form" onSubmit={handleSubmit}>
            <FormGroup className="text-start">
              <Label htmlFor="Signin__input-username">
                <b>Username</b>
              </Label>
              <Input
                id="Signin__input-username"
                type="text"
                name="username"
                value={formData.username}
                required
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup className="text-start">
              <Label htmlFor="Signin__input-password">
                <b>Password</b>
              </Label>
              <Input
                id="Signin__input-password"
                type="password"
                name="password"
                value={formData.password}
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

export default Signin;
