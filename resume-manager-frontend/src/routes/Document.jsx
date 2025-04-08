import { useContext, useEffect, useState } from 'react';
import { Alert, Button } from 'reactstrap';

import ResumeManagerApi from '../api';
import DocumentSelect from '../components/DocumentSelect';
import NewDocumentForm from '../components/NewDocumentForm';
import SectionsList from '../components/SectionsList.jsx';
import { DocumentContext, UserContext } from '../contexts.jsx';

import trashIcon from '../assets/trash.svg';

// ==================================================

/**
 * This is the core webpage / component of the app.  Displays the document and
 * allows interacting with it, as well as gives document selection.
 */
function Document() {
  const [document, setDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDocumentSelectOpen, setIsDocumentSelectOpen] = useState(true);
  const [isNewDocumentFormOpen, setIsNewDocumentFormOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState(null);
  const { user } = useContext(UserContext);

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      // User info should have already been retrieved.
      if (document === null) {
        setDocuments(await ResumeManagerApi.getDocuments());
      }
    }

    runEffect();
  }, [user, document]);

  // --------------------------------------------------

  function closeDocumentSelect() {
    setIsDocumentSelectOpen(false);
  }

  function closeNewDocumentForm() {
    setIsNewDocumentFormOpen(false);
  }

  /**
   * Gets a document and its contents for displaying.  A document ID of 0
   * signifies to create a new document.
   *
   * @param {String} documentId - ID of the document to retrieve and display.
   */
  async function loadDocument(documentId) {
    if (documentId === '0') {
      setIsNewDocumentFormOpen(true);
    } else {
      try {
        setDocument(await ResumeManagerApi.getDocument(documentId));
      } catch (err) {
        setErrorMessages(err);
        setTimeout(() => setErrorMessages(null), 5000);
      }
    }

    setIsDocumentSelectOpen(false);
  }

  /**
   * Sends a network call to create a new document, updates the list of
   * documents that the user has with the new document, and updates the document
   * state with the new document.
   *
   * @param {Object} formData - Required data to create a new document.
   * @see ResumeManagerApi.createDocument for formData properties.
   */
  async function createDocument(formData) {
    try {
      const newDocument = await ResumeManagerApi.createDocument(formData);

      // Adds the new document to list of already retrieved ones to reduce an
      // extra, unnecessary network call.  Shallow copying because the data
      // might be large.
      setDocuments([...documents, { ...newDocument }]);

      // Gets and adds contact info to the new document.  This is done instead
      // of calling the URL to retrieve a document and its contents, because
      // this requires less processing by the database.
      newDocument.contactInfo = await ResumeManagerApi.getContactInfo();

      setDocument(newDocument);
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages(null), 5000);
    } finally {
      setIsNewDocumentFormOpen(false);
    }
  }

  /**
   * Deletes a document, which could be a resume or template.  Updates the
   * document and documents state locally to reflect deletion.
   */
  async function deleteDocument() {
    const documentId = window.document.querySelector('#Document').dataset.id;

    try {
      await ResumeManagerApi.deleteDocument(documentId);
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages(null), 5000);
      return;
    }

    // Clear out currently-viewing document.
    setDocument(null);

    // Find the document in the list of documents and remove it.
    const documentIdx = documents.findIndex(
      (document) => document.id == documentId
    );
    documents.splice(documentIdx, 1);

    // Shallow copying because the data might be large.
    setDocuments([...documents]);
  }

  // --------------------------------------------------

  return (
    <DocumentContext.Provider value={[document, setDocument]}>
      <main id="Document" data-id={document?.id}>
        <Button onClick={() => setIsDocumentSelectOpen(true)}>
          Select Document
        </Button>
        {document && !document.isMaster && (
          <Button onClick={deleteDocument}>
            {<img src={trashIcon} alt="trash icon" />}
          </Button>
        )}
        {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
        {isDocumentSelectOpen && (
          <DocumentSelect
            documents={documents}
            loadDocument={loadDocument}
            closeDocumentSelect={closeDocumentSelect}
          />
        )}
        {isNewDocumentFormOpen && (
          <NewDocumentForm
            createDocument={createDocument}
            close={closeNewDocumentForm}
          />
        )}
        {document && <SectionsList />}
      </main>
    </DocumentContext.Provider>
  );
}

// ==================================================

export default Document;
