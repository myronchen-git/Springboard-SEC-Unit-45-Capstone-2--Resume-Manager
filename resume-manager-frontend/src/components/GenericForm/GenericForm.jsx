import { useContext, useState } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';

import {
  getFormInputPattern,
  getFormInputPlaceholder,
} from '../../commonData.js';
import { AppContext } from '../../contexts.jsx';

import './GenericForm.css';

// ==================================================

/**
 * A form to display an education's, experience's, or other's fields, which will
 * be used to create a new section item or update an existing one.
 *
 * @param {Object} props - React component properties.
 * @param {Object[]} props.fields - Contains a list of Objects with jsName
 *  (JavaScript name) and displayName to use for populating form inputs.
 * @param {Number} props.optionalFieldsStartIndex - Index in fields argument
 *  where the optional fields start.
 * @param {Object} props.initialFormData - Contains the fields and values to
 *  show upon opening the form.
 * @param {Function} props.processSubmission - Handles and submits the form
 *  data.
 */
function GenericForm({
  fields,
  optionalFieldsStartIndex,
  initialFormData,
  processSubmission,
}) {
  const { addAlert } = useContext(AppContext);

  const [formData, setFormData] = useState(initialFormData);

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
      return err.forEach((message) => addAlert(message, 'danger'));
    }
  }

  // --------------------------------------------------

  const getRequiredIndicator = (idx) =>
    idx < optionalFieldsStartIndex ? ' *' : '';

  return (
    <Form className="GenericForm__form" onSubmit={handleSubmit}>
      {fields.map((field, idx) => (
        <FormGroup key={field.jsName} className="text-start">
          <Label htmlFor={`GenericForm-${Date.now()}__input-${field.jsName}`}>
            <b>{field.displayName + getRequiredIndicator(idx)}</b>
          </Label>
          <Input
            id={`GenericForm-${Date.now()}__input-${field.jsName}`}
            type="text"
            name={field.jsName}
            placeholder={getFormInputPlaceholder(field.jsName)}
            pattern={getFormInputPattern(field.jsName)}
            value={formData[field.jsName]}
            required={idx < optionalFieldsStartIndex}
            onChange={handleChange}
          />
        </FormGroup>
      ))}
      <Button color="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}

// ==================================================

export default GenericForm;
