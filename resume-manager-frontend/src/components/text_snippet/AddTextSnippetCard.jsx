import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Component for showing and controlling the form to add a new text snippet
 * entry.
 *
 * @param {Function} addTextSnippet - Takes the data for a new text snippet.
 *  Then creates and adds a text snippet to an education, skill, project, etc..
 */
function AddTextSnippetCard({ addTextSnippet }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const initialFormData = {
    type: 'plain',
    content: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  function toggleOpen() {
    setIsRevealed(!isRevealed);
    setFormData(initialFormData);
    setErrorMessages([]);
  }

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    // Removing fields with empty Strings, so that the back-end does not assume
    // a user is trying to update particular fields.
    const formDataCopy = { ...formData };
    for (const prop in formDataCopy) {
      if (!formDataCopy[prop]) delete formDataCopy[prop];
    }

    try {
      await addTextSnippet(formDataCopy);
    } catch (err) {
      setErrorMessages(err);
      return;
    }

    toggleOpen();
  }

  // --------------------------------------------------

  // Used for reducing duplicate code for inputs.  Always keep up to date, with
  // optional fields last!
  // [JavaScript name, user-facing name]
  const fields = [['content', 'Content']];

  // Always keep up to date!
  const optionalFieldsStartIndex = 1;

  const getRequiredIndicator = (idx) => idx < optionalFieldsStartIndex && ' *';

  return (
    <Card className="AddTextSnippetCard">
      {isRevealed ? (
        <>
          <CardHeader className="text-end">
            <img src={trashIcon} alt="trash icon" onClick={toggleOpen} />
          </CardHeader>
          <CardBody>
            <Form className="AddTextSnippetCard__form" onSubmit={handleSubmit}>
              {fields.map((field, idx) => (
                <FormGroup key={field[0]} className="text-start">
                  <Label htmlFor={`AddTextSnippetCard__input-${field[0]}`}>
                    <b>{field[1]}</b>
                    {getRequiredIndicator(idx)}
                  </Label>
                  <Input
                    id={`AddTextSnippetCard__input-${field[0]}`}
                    type="text"
                    name={field[0]}
                    value={formData[field[0]]}
                    required={idx < optionalFieldsStartIndex}
                    onChange={handleChange}
                  />
                </FormGroup>
              ))}
              {errorMessages.map((msg) => (
                <Alert key={msg} color="danger">
                  {msg}
                </Alert>
              ))}
              <Button color="light" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody onClick={toggleOpen}>
          Add Text
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddTextSnippetCard;
