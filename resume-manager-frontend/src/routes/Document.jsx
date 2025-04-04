import { useContext, useEffect, useState } from 'react';
import { Button } from 'reactstrap';

import ResumeManagerApi from '../api';
import DocumentSelect from '../components/DocumentSelect';
import NewDocumentForm from '../components/NewDocumentForm';
import { UserContext } from '../contexts.jsx';

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
  const { user } = useContext(UserContext);

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      // User info should have already been retrieved.
      if (document === null) {
        setDocuments(await ResumeManagerApi.getDocuments(user.username));
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

  async function loadDocument(documentId) {
    if (documentId === '0') {
      setIsNewDocumentFormOpen(true);
    } else {
      setDocument(
        await ResumeManagerApi.getDocument(user.username, documentId)
      );
    }

    setIsDocumentSelectOpen(false);
  }

  async function createDocument(formData) {
    const newDocument = await ResumeManagerApi.createDocument(
      user.username,
      formData
    );

    // Adds the new document to list of already retrieved ones to reduce an
    // extra, unnecessary network call.
    setDocuments([...documents, { ...newDocument }]);

    // Gets and adds contact info to the new document.  This is done instead of
    // calling the URL to retrieve a document and its contents, because this
    // requires less processing by the database.
    newDocument.contactInfo = await ResumeManagerApi.getContactInfo(
      user.username
    );

    setDocument(newDocument);
    setIsNewDocumentFormOpen(false);
  }

  // --------------------------------------------------

  return (
    <main className="Document">
      <Button onClick={() => setIsDocumentSelectOpen(true)}>
        Select Document
      </Button>
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
      {/* placeholder */}
      {document && (
        <p>
          Document Name: {document?.documentName}
          <br />
          Full Name: {document?.contactInfo?.fullName}
        </p>
      )}
    </main>
  );
}

// ==================================================

export default Document;
