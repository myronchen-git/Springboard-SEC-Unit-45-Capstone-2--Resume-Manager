import { useState } from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

// ==================================================

/**
 * Displays a form in a modal to allow providing required info for a new
 * document.
 *
 * @param {Object} props - React component properties.
 * @param {Function} props.createDocument - Receives arguments and sends a
 *  request to back-end to create a document.
 * @param {Function} props.close - Sets a state that should then close this
 *  modal React component.  This helps to cancel new document creation.
 */
function NewDocumentForm({ createDocument, close }) {
  const initialFormData = {
    documentName: '',
    isTemplate: false,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState(null);

  // --------------------------------------------------

  function handleChange(evt) {
    let { name, value, checked } = evt.target;

    if (name === 'isTemplate') value = checked;

    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await createDocument(formData);
    } catch (err) {
      setErrorMessages(err);
      return;
    }
  }

  // --------------------------------------------------

  return (
    <Modal
      className="NewDocumentForm"
      isOpen={true}
      backdrop="static"
      fade={false}
    >
      <Form className="NewDocumentForm__form" onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label htmlFor="NewDocumentForm__input-document-name">
              <b>Document Name</b>
            </Label>
            <Input
              id="NewDocumentForm__input-document-name"
              type="text"
              name="documentName"
              value={formData.documentName}
              required
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Input
              id="NewDocumentForm__input-template"
              type="checkbox"
              name="isTemplate"
              onChange={handleChange}
            />
            <Label htmlFor="NewDocumentForm__input-template">Template?</Label>
          </FormGroup>
          {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button type="submit">Create</Button>
          <Button onClick={close}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

// ==================================================

export default NewDocumentForm;
