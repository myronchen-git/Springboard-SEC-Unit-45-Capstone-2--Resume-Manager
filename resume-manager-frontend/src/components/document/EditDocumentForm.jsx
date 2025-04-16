import { useContext, useState } from 'react';
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

import { DocumentContext } from '../../contexts';

// ==================================================

/**
 * Displays a form in a modal to allow editing a document's properties.  Only
 * allows updating the document name if the document is the master resume.
 *
 * @param {Object} props - React component properties.
 * @param {Function} props.editDocument - Receives arguments and sends a
 *  request to back-end to edit a document.
 * @param {Function} props.close - Sets a state that should then close this
 *  modal React component.  This helps to cancel editing a document.
 */
function EditDocumentForm({ editDocument, close }) {
  const [document] = useContext(DocumentContext);
  const initialFormData = document.isMaster
    ? { documentName: document.documentName }
    : {
        documentName: document.documentName,
        isTemplate: document.isTemplate,
        isLocked: document.isLocked,
      };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  function handleChange(evt) {
    let { name, value, checked } = evt.target;

    if (name === 'isTemplate' || name === 'isLocked') value = checked;

    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await editDocument(formData);
    } catch (err) {
      setErrorMessages(err);
      return;
    }
  }

  // --------------------------------------------------

  return (
    <Modal
      className="EditDocumentForm"
      isOpen={true}
      backdrop="static"
      fade={false}
    >
      <Form className="EditDocumentForm__form" onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label htmlFor="EditDocumentForm__input-document-name">
              <b>Document Name</b>
            </Label>
            <Input
              id="EditDocumentForm__input-document-name"
              type="text"
              name="documentName"
              value={formData.documentName}
              onChange={handleChange}
            />
          </FormGroup>
          {!document.isMaster && (
            <>
              <FormGroup>
                <Input
                  id="EditDocumentForm__input-template"
                  type="checkbox"
                  name="isTemplate"
                  checked={formData.isTemplate}
                  onChange={handleChange}
                />
                <Label htmlFor="EditDocumentForm__input-template">
                  Template? (unimplemented)
                </Label>
              </FormGroup>
              <FormGroup>
                <Input
                  id="EditDocumentForm__input-lock"
                  type="checkbox"
                  name="isLocked"
                  checked={formData.isLocked}
                  onChange={handleChange}
                />
                <Label htmlFor="EditDocumentForm__input-lock">
                  Lock? (unimplemented)
                </Label>
              </FormGroup>
            </>
          )}
          {errorMessages.map((msg) => (
            <Alert key={msg} color="danger">
              {msg}
            </Alert>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button type="submit">Edit</Button>
          <Button onClick={close}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

// ==================================================

export default EditDocumentForm;
