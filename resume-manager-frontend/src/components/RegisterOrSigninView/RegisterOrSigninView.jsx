import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import './RegisterOrSigninView.css';

// ==================================================

/**
 * Displays the view for either the register or signin webpages.
 *
 * @param {Object} props - React component properties.
 * @param {String} props.name - Either "Register" or "Signin".
 * @param {Function} props.handleChange - Updates parent's state when inputs are
 *  given.
 * @param {Function} props.handleSubmit - Processes the form data in the parent
 *  component.
 * @param {Function} props.handleCancel - Handles cancelling the registration or
 *  signing in.
 */
function RegisterOrSigninView({
  name,
  formData,
  handleChange,
  handleSubmit,
  handleCancel,
}) {
  return (
    <main className={name}>
      <Card className={`${name}__card`}>
        <CardBody>
          <CardTitle tag={'h2'}>{name}</CardTitle>
          <Form className={`${name}__form`} onSubmit={handleSubmit}>
            <FormGroup className="text-start">
              <Label htmlFor={`${name}__input-username`}>
                <b>Username</b>
              </Label>
              <Input
                id={`${name}__input-username`}
                type="text"
                name="username"
                value={formData.username}
                required
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup className="text-start">
              <Label htmlFor={`${name}__input-password`}>
                <b>Password</b>
              </Label>
              <Input
                id={`${name}__input-password`}
                type="password"
                name="password"
                value={formData.password}
                required
                onChange={handleChange}
              />
            </FormGroup>
            {name === 'Register' && (
              <FormGroup className="text-start">
                <Label htmlFor={`${name}__input-repeated-password`}>
                  <b>Repeat Password</b>
                </Label>
                <Input
                  id={`${name}__input-repeated-password`}
                  type="password"
                  name="repeatedPassword"
                  value={formData.repeatedPassword}
                  required
                  onChange={handleChange}
                />
              </FormGroup>
            )}
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

export default RegisterOrSigninView;
