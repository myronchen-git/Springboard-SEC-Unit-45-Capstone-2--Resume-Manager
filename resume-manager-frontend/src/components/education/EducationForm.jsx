import { useState } from 'react';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';

import {
  EDUCATION_FIELDS,
  EDUCATION_OPTIONAL_FIELDS_START_INDEX,
  getFormInputPattern,
  getFormInputPlaceholder,
} from '../../commonData.js';

// ==================================================

/**
 * A form to display an education's fields, which will be used to create a new
 * education or update an existing one.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.initialFormData - Contains the fields and values to
 *  show upon opening the form.
 * @see EDUCATION_FIELDS for the list of fields.
 * @param {Function} props.processSubmission - Handles and submits the form
 *  data.
 */
function EducationForm({ initialFormData, processSubmission }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await processSubmission(formData);
    } catch (err) {
      setErrorMessages(err);
      return;
    }
  }

  // --------------------------------------------------

  const getRequiredIndicator = (idx) =>
    idx < EDUCATION_OPTIONAL_FIELDS_START_INDEX ? ' *' : '';

  return (
    <Form className="EducationForm__form" onSubmit={handleSubmit}>
      {EDUCATION_FIELDS.map((field, idx) => (
        <FormGroup key={field.jsName} className="text-start">
          <Label htmlFor={`EducationForm__input-${field.jsName}`}>
            <b>{field.displayName + getRequiredIndicator(idx)}</b>
          </Label>
          <Input
            id={`EducationForm__input-${field.jsName}`}
            type="text"
            name={field.jsName}
            placeholder={getFormInputPlaceholder(field.jsName)}
            pattern={getFormInputPattern(field.jsName)}
            value={formData[field.jsName]}
            required={idx < EDUCATION_OPTIONAL_FIELDS_START_INDEX}
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
        Submit
      </Button>
    </Form>
  );
}

// ==================================================

export default EducationForm;
