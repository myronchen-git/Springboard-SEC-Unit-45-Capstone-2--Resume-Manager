import { useContext, useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

import { AppContext } from '../../../contexts.jsx';

// ==================================================

/**
 * Displays a form in a modal for submitting a document's properties.  Can be
 * used for creating a new document or editing an existing one.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.initialFormData - The initial form data to display.
 * This is also used to determine which fields to show.
 * @param {Function} props.submitFunction - Receives the form data and sends a
 *  request to back-end.
 * @param {String} props.submitText - The submit button text.
 * @param {Function} props.close - Sets a state that should then close this
 *  modal React component.  This helps to cancel creating or editing a document.
 */
function DocumentForm({ initialFormData, submitFunction, submitText, close }) {
  const { addAlert } = useContext(AppContext);

  const [formData, setFormData] = useState(initialFormData);

  // --------------------------------------------------

  function handleChange(evt) {
    let { name, value, checked } = evt.target;

    if (name === 'isTemplate' || name === 'isLocked') value = checked;

    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await submitFunction(formData);
    } catch (err) {
      return err.forEach((message) => addAlert(message, 'danger'));
    }
  }

  // --------------------------------------------------

  return (
    <Modal
      className="DocumentForm"
      isOpen={true}
      backdrop="static"
      fade={false}
    >
      <Form className="DocumentForm__form" onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label htmlFor="DocumentForm__input-document-name">
              <b>Document Name</b>
            </Label>
            <Input
              id="DocumentForm__input-document-name"
              type="text"
              name="documentName"
              value={formData.documentName}
              onChange={handleChange}
            />
          </FormGroup>
          {Object.hasOwn(formData, 'isTemplate') && (
            <FormGroup>
              <Input
                id="DocumentForm__input-template"
                type="checkbox"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={handleChange}
              />
              <Label htmlFor="DocumentForm__input-template">Template?</Label>
            </FormGroup>
          )}
          {Object.hasOwn(formData, 'isLocked') && (
            <FormGroup>
              <Input
                id="DocumentForm__input-lock"
                type="checkbox"
                name="isLocked"
                checked={formData.isLocked}
                onChange={handleChange}
              />
              <Label htmlFor="DocumentForm__input-lock">Lock?</Label>
            </FormGroup>
          )}
        </ModalBody>
        <ModalFooter>
          <Button type="submit" color="primary">
            {submitText}
          </Button>
          <Button color="primary" onClick={close}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

// ==================================================

export default DocumentForm;
