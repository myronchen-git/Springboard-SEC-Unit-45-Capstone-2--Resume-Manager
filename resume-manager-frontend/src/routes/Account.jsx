import PropTypes from 'prop-types';
import { useState } from 'react';
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

// ==================================================

/**
 * Displays and handles the form to update account info.
 *
 * @param {Object} props - React component properties.
 * @param {Function} props.updateAccount - Updates a user's account.
 */
function Account({ updateAccount }) {
  const initialFormData = {
    oldPassword: '',
    newPassword: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState(null);
  const navigate = useNavigate();

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await updateAccount(formData);
    } catch (err) {
      setErrorMessages(err);
      return;
    }

    navigate('/');
  }

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
                value={formData.password}
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
                value={formData.password}
                required
                onChange={handleChange}
              />
            </FormGroup>
            {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
            <Button color="light" type="submit">
              Submit
            </Button>
          </Form>
        </CardBody>
      </Card>
    </main>
  );
}

// ==================================================

Account.propTypes = {
  updateAccount: PropTypes.func.isRequired,
};

export default Account;
