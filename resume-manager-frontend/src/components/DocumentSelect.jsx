import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
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
 * Displays a modal that allows selecting a document to open or create.  Ensure
 * that there is no document with ID = 0 in the database, as that will be used
 * to signify that a new document is desired.
 *
 * @param {Object} props - React component properties.
 * @param {Object[]} props.documents - An Array of document Objects used to
 *  display which documents to open.
 * @param {Function} props.loadDocument - Fetches the selected document or
 *  creates a new one.
 * @param {Function} props.closeDocumentSelect - Closes this component by
 *  setting a state, which will then cause this component to unmount.  This is
 *  used to cancel document selection.
 */
function DocumentSelect({ documents, loadDocument, closeDocumentSelect }) {
  const [documentId, setDocumentId] = useState(null);
  const [errorMessages, setErrorMessages] = useState(null);

  function handleChange(evt) {
    const { value } = evt.target;
    setDocumentId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await loadDocument(documentId);
    } catch (err) {
      setErrorMessages(err);
      return;
    }
  }

  return (
    <Modal
      className="DocumentSelect"
      isOpen={true}
      backdrop="static"
      fade={false}
    >
      <Form className="DocumentSelect__form" onSubmit={handleSubmit}>
        <ModalBody>
          {documents.map((doc) => (
            <FormGroup key={doc.id}>
              <Input
                id={`DocumentSelect__input-doc-${doc.id}`}
                name="selected-document"
                type="radio"
                value={doc.id}
                required
                onChange={handleChange}
              />
              <Label htmlFor={`DocumentSelect__input-doc-${doc.id}`}>
                <Card>
                  <CardBody>
                    <CardTitle>{doc.documentName}</CardTitle>
                    <CardText>
                      Created on: {new Date(doc.createdOn).toString()}
                      <br />
                      Last updated: {doc.lastUpdated}
                      <br />
                      Master: {doc.isMaster.toString()}
                      <br />
                      Template: {doc.isTemplate.toString()}
                      <br />
                      Locked: {doc.isLocked.toString()}
                      <br />
                    </CardText>
                  </CardBody>
                </Card>
              </Label>
            </FormGroup>
          ))}
          {/* Ensure that there is no document with ID = 0. */}
          <FormGroup key="0">
            <Input
              id={`DocumentSelect__input-doc-0`}
              name="selected-document"
              type="radio"
              value="0"
              required
              onChange={handleChange}
            />
            <Label htmlFor={`DocumentSelect__input-doc-0`}>
              <Card>
                <CardBody>
                  <CardTitle>New Resume</CardTitle>
                  <CardText>+</CardText>
                </CardBody>
              </Card>
            </Label>
          </FormGroup>
          {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button type="submit">Open</Button>
          <Button onClick={closeDocumentSelect}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}

// ==================================================

DocumentSelect.propTypes = {
  documents: PropTypes.array.isRequired,
  loadDocument: PropTypes.func.isRequired,
  closeDocumentSelect: PropTypes.func.isRequired,
};

export default DocumentSelect;
