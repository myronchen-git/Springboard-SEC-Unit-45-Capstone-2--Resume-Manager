import { useContext, useEffect, useState } from 'react';
import { Alert, Button } from 'reactstrap';

import ResumeManagerApi from '../api';
import ContactInfoCard from '../components/ContactInfoCard.jsx';
import DocumentSelect from '../components/DocumentSelect';
import EditDocumentForm from '../components/EditDocumentForm.jsx';
import NewDocumentForm from '../components/NewDocumentForm';
import SectionsList from '../components/SectionsList.jsx';
import { DocumentContext, UserContext } from '../contexts.jsx';

import pencilIcon from '../assets/pencil.svg';
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
  const [isEditDocumentFormOpen, setIsEditDocumentFormOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
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
        setTimeout(() => setErrorMessages([]), 5000);
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
    let newDocument;
    try {
      newDocument = await ResumeManagerApi.createDocument(formData);

      // Adds the new document to list of already retrieved ones to reduce an
      // extra, unnecessary network call.  Shallow copying because the data
      // might be large.
      setDocuments([...documents, { ...newDocument }]);
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    } finally {
      setIsNewDocumentFormOpen(false);
    }

    try {
      // Gets and adds contact info to the new document.  This is done instead
      // of calling the URL to retrieve a document and its contents, because
      // this requires less processing by the database.
      const contactInfo = await ResumeManagerApi.getContactInfo();

      // Removing extra username property, because document Object/state doesn't
      // have it.
      delete contactInfo.username;

      newDocument.contactInfo = contactInfo;
    } catch (err) {
      // Do nothing if API call throws an error, because contact info is not
      // significant in a new document.  It can always be updated in the master.
      // If error is thrown, then user will see empty fields for contact info.
      // User can always re-input the information.  The re-inputted information
      // will just update the database.
      console.warn(err);
    }

    setDocument(newDocument);
  }

  /**
   * Deletes a document, which could be a resume or template.  Updates the
   * document and documents state locally to reflect deletion.
   */
  async function deleteDocument() {
    try {
      await ResumeManagerApi.deleteDocument(document.id);
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    // Clear out currently-viewing document.
    setDocument(null);

    // Find the document in the list of documents and remove it.
    const documentIdx = documents.findIndex(
      (documentInDocuments) => documentInDocuments.id == document.id
    );
    documents.splice(documentIdx, 1);

    // Shallow copying because the data might be large.
    setDocuments([...documents]);
  }

  /**
   * Sends an API request to update a document's properties.  Then updates the
   * list of documents and the document state with the updated info.
   *
   * @param {Object} formData - Holds updated document properties.
   * @see ResumeManagerApi.updateDocument for formData properties.
   */
  async function editDocument(formData) {
    let updatedDocument;
    try {
      updatedDocument = await ResumeManagerApi.updateDocument(
        document.id,
        formData
      );
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    } finally {
      setIsEditDocumentFormOpen(false);
    }

    const documentsCopy = [...documents];

    // Find the document in the list of documents and replace it.
    const documentIdx = documentsCopy.findIndex(
      (documentInDocuments) => documentInDocuments.id == document.id
    );
    documentsCopy[documentIdx] = updatedDocument;

    // Updating documents list.
    setDocuments(documentsCopy);

    // Updating document state.
    setDocument({ ...document, ...updatedDocument });
  }

  // --------------------------------------------------

  return (
    <DocumentContext.Provider value={[document, setDocument]}>
      <main id="Document">
        <Button onClick={() => setIsDocumentSelectOpen(true)}>
          Select Document
        </Button>
        {document && (
          <Button onClick={() => setIsEditDocumentFormOpen(true)}>
            <img src={pencilIcon} alt="edit icon" />
          </Button>
        )}
        {document && !document.isMaster && (
          <Button onClick={deleteDocument}>
            <img src={trashIcon} alt="trash icon" />
          </Button>
        )}
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        {isDocumentSelectOpen && (
          <DocumentSelect
            documents={documents}
            loadDocument={loadDocument}
            closeDocumentSelect={() => setIsDocumentSelectOpen(false)}
          />
        )}
        {isNewDocumentFormOpen && (
          <NewDocumentForm
            createDocument={createDocument}
            close={() => setIsNewDocumentFormOpen(false)}
          />
        )}
        {isEditDocumentFormOpen && (
          <EditDocumentForm
            editDocument={editDocument}
            close={() => setIsEditDocumentFormOpen(false)}
          />
        )}
        {document && (
          <article>
            <ContactInfoCard />
            <SectionsList />
          </article>
        )}
      </main>
    </DocumentContext.Provider>
  );
}

// ==================================================

export default Document;
