import { useContext, useEffect, useState } from 'react';
import { Button } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import ContactInfoCard from '../../components/ContactInfoCard/ContactInfoCard.jsx';
import DocumentForm from '../../components/document/DocumentForm/DocumentForm.jsx';
import DocumentSelect from '../../components/document/DocumentSelect/DocumentSelect.jsx';
import SectionsList from '../../components/general_section/SectionsList/SectionsList.jsx';
import { AppContext, DocumentContext, UserContext } from '../../contexts.jsx';

import pencilIcon from '../../assets/pencil.svg';
import TrashButton from '../../components/TrashButton/TrashButton.jsx';

import './Document.css';

// ==================================================

/**
 * This is the core webpage / component of the app.  Displays the document and
 * allows interacting with it, as well as gives document selection.
 */
function Document() {
  const { addAlert } = useContext(AppContext);
  const { user } = useContext(UserContext);

  const [document, setDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDocumentSelectOpen, setIsDocumentSelectOpen] = useState(true);
  const [isNewDocumentFormOpen, setIsNewDocumentFormOpen] = useState(false);
  const [isEditDocumentFormOpen, setIsEditDocumentFormOpen] = useState(false);

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
   * @param {Number} documentId - ID of the document to retrieve and display.
   */
  async function loadDocument(documentId) {
    setDocument(null);

    if (documentId === 0) {
      setIsNewDocumentFormOpen(true);
    } else {
      try {
        setDocument(await ResumeManagerApi.getDocument(documentId));
      } catch (err) {
        err.forEach((message) => addAlert(message, 'danger'));
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
      return err.forEach((message) => addAlert(message, 'danger'));
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
      return err.forEach((message) => addAlert(message, 'danger'));
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
      return err.forEach((message) => addAlert(message, 'danger'));
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
        <header className="Document__header-toolbar">
          <div className="Document__header-toolbar__buttons">
            <Button
              color="primary"
              onClick={() => setIsDocumentSelectOpen(true)}
            >
              Select Document
            </Button>
            {document && (
              <Button
                color="primary"
                onClick={() => setIsEditDocumentFormOpen(true)}
              >
                <img src={pencilIcon} alt="edit icon" />
              </Button>
            )}
            {document && !document.isMaster && (
              <TrashButton clickFunc={deleteDocument} />
            )}
          </div>
          {document && <h4>{document.documentName}</h4>}
        </header>
        {isDocumentSelectOpen && (
          <DocumentSelect
            documents={documents}
            loadDocument={loadDocument}
            close={() => setIsDocumentSelectOpen(false)}
          />
        )}
        {isNewDocumentFormOpen && (
          <DocumentForm
            // initialFormData={{ documentName: '', isTemplate: false }}
            initialFormData={{ documentName: '' }}
            submitFunction={createDocument}
            submitText="Create"
            close={() => setIsNewDocumentFormOpen(false)}
          />
        )}
        {isEditDocumentFormOpen && (
          <DocumentForm
            // initialFormData={
            //   document.isMaster
            //     ? { documentName: document.documentName }
            //     : {
            //         documentName: document.documentName,
            //         isTemplate: document.isTemplate,
            //         isLocked: document.isLocked,
            //       }
            // }
            initialFormData={{ documentName: document.documentName }}
            submitFunction={editDocument}
            submitText="Edit"
            close={() => setIsEditDocumentFormOpen(false)}
          />
        )}
        {document && (
          <article className="Document__page shadow">
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
