import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      // Redirects anyone not logged in.  This functionality might be moved to a
      // parent route, in a route protector.
      if (!user.username) navigate('/');

      if (user.username && document === null) {
        setDocuments(await ResumeManagerApi.getDocuments(user.username));
      }
    }

    runEffect();
  }, [user, navigate, document]);

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
      // Retrieve document and contents.
    }

    setIsDocumentSelectOpen(false);
  }

  async function createDocument(formData) {
    setDocument(await ResumeManagerApi.createDocument(user.username, formData));
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
    </main>
  );
}

// ==================================================

export default Document;
