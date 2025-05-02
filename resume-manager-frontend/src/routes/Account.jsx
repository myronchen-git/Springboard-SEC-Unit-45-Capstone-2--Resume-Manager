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

import './Account.css';

// ==================================================

/**
 * Displays and handles the form to update account info.
 */
function Account() {
  const initialFormData = {
    oldPassword: '',
    newPassword: '',
    repeatedNewPassword: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState([]);
  const { updateAccount } = useContext(UserContext);
  const navigate = useNavigate();

  // --------------------------------------------------

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (formData.newPassword !== formData.repeatedNewPassword) {
      return setErrorMessages([
        'New password and repeated new password do not match.',
      ]);
    }

    const formDataCopy = { ...formData };
    delete formDataCopy.repeatedNewPassword;

    try {
      await updateAccount(formDataCopy);
    } catch (err) {
      return setErrorMessages(err);
    }

    navigate('/document');
  }

  // --------------------------------------------------

  return (
    <main className="Account">
      <Card>
        <CardBody>
          <CardTitle tag={'h2'}>Account</CardTitle>
          <Form className="Account__form" onSubmit={handleSubmit}>
            <FormGroup className="text-start">
              <Label htmlFor="Account__input-old-password">
                <b>Old Password</b>
              </Label>
              <Input
                id="Account__input-password"
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                required
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup className="text-start">
              <Label htmlFor="Account__input-new-password">
                <b>New Password</b>
              </Label>
              <Input
                id="Account__input-password"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                required
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup className="text-start">
              <Label htmlFor="Account__input-repeated-new-password">
                <b>Repeat New Password</b>
              </Label>
              <Input
                id="Account__input-repeated-new-password"
                type="password"
                name="repeatedNewPassword"
                value={formData.repeatedNewPassword}
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
          </Form>
        </CardBody>
      </Card>
    </main>
  );
}

// ==================================================

export default Account;
