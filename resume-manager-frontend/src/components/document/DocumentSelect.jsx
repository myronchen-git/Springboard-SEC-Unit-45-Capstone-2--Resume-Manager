import { useMemo, useState } from 'react';
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

import { generateDateTimeString } from '../../util/conversions';

import './DocumentSelect.css';

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
 * @param {Function} props.close - Closes this component by
 *  setting a state, which will then cause this component to unmount.  This is
 *  used to cancel document selection.
 */
function DocumentSelect({ documents, loadDocument, close }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  function handleChange(evt) {
    const { value } = evt.target;
    setSelectedOption(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    try {
      await loadDocument(Number(selectedOption));
    } catch (err) {
      setErrorMessages(err);
      return;
    }
  }

  // --------------------------------------------------

  function DocumentOption({ document, selectedOption, handleChange }) {
    const createdDateTime = useMemo(
      () => generateDateTimeString(document.createdOn),
      [document]
    );

    const updatedDateTime = useMemo(
      () =>
        document.lastUpdated && generateDateTimeString(document.lastUpdated),
      [document]
    );

    return (
      <FormGroup tag="li">
        <Input
          id={`DocumentSelect__input-doc-${document.id}`}
          name="selected-document"
          type="radio"
          value={document.id}
          checked={selectedOption == document.id}
          required
          onChange={handleChange}
        />
        <Label htmlFor={`DocumentSelect__input-doc-${document.id}`}>
          <Card tag="article">
            <CardBody tag="section">
              <CardTitle tag="h4">{document.documentName}</CardTitle>
              <CardText tag="section">
                <p>
                  Created on:
                  <br />
                  {createdDateTime}
                </p>
                <p>
                  Last updated:
                  <br />
                  {updatedDateTime}
                </p>
              </CardText>
            </CardBody>
          </Card>
        </Label>
      </FormGroup>
    );
  }

  function AddNewResumeOption({ selectedOption, handleChange }) {
    // Ensure that there is no document with ID = 0.
    return (
      <FormGroup className="AddNewResumeOption" tag="li">
        <Input
          id={`DocumentSelect__input-doc-0`}
          name="selected-document"
          type="radio"
          value="0"
          checked={selectedOption == 0}
          required
          onChange={handleChange}
        />
        <Label htmlFor={`DocumentSelect__input-doc-0`}>
          <Card tag="article">
            <CardBody tag="section">
              <CardTitle tag="h6">New Resume</CardTitle>
              <CardText tag="section">+</CardText>
            </CardBody>
          </Card>
        </Label>
      </FormGroup>
    );
  }

  return (
    <Modal
      className="DocumentSelect"
      isOpen={true}
      backdrop="static"
      fade={false}
    >
      <Form className="DocumentSelect__form" onSubmit={handleSubmit}>
        <ModalBody tag="main">
          <ul>
            {documents.map((doc) => (
              <DocumentOption
                key={doc.id}
                document={doc}
                selectedOption={selectedOption}
                handleChange={handleChange}
              />
            ))}
            <AddNewResumeOption
              selectedOption={selectedOption}
              handleChange={handleChange}
            />
          </ul>
          {errorMessages.map((msg) => (
            <Alert key={msg} color="danger">
              {msg}
            </Alert>
          ))}
        </ModalBody>
        <ModalFooter tag="footer">
          <Button type="submit" color="primary">
            Open
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

export default DocumentSelect;
