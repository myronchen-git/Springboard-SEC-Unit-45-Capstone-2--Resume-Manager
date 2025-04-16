import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Renders a view for displaying and editing a text snippet.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.textSnippet - The text snippet object, that contains
 *  properties like content, to display.
 * @param {Boolean} props.addBullet - Whether to add a bullet point to the
 *  beginning of the text content.
 */
function TextSnippetCard({
  textSnippet,
  detachTextSnippet,
  removeTextSnippetFromDocumentState,
  addBullet = true,
}) {
  const [document] = useContext(DocumentContext);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  /**
   * If the document is the master resume, deletes the text snippet, that was
   * clicked on, from the database.
   *
   * If the document is not the master resume, removes the text snippet from the
   * document, but keeps the text snippet entry.
   *
   * Locally updates the document Object in the app state.
   */
  async function deleteTextSnippet() {
    try {
      if (document.isMaster) {
        await ResumeManagerApi.deleteTextSnippet(
          textSnippet.id,
          textSnippet.version
        );
      } else {
        await detachTextSnippet(textSnippet.id);
      }
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    removeTextSnippetFromDocumentState(textSnippet.id);
  }

  // --------------------------------------------------

  return (
    <Card className="TextSnippetCard">
      <CardHeader className="text-end">
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        <img src={trashIcon} alt="trash icon" onClick={deleteTextSnippet} />
      </CardHeader>
      <CardBody className="text-start">
        {addBullet && <>&bull; </>}
        {textSnippet.content}
      </CardBody>
    </Card>
  );
}

// ==================================================

export default TextSnippetCard;
