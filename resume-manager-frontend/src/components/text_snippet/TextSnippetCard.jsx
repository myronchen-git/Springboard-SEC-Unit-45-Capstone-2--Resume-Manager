import { Draggable } from '@hello-pangea/dnd';
import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import {
  TEXT_SNIPPET_FIELDS,
  TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX,
} from '../../commonData.js';
import { DocumentContext, TextSnippetContext } from '../../contexts.jsx';
import GenericForm from '../GenericForm.jsx';

import pencilIcon from '../../assets/pencil.svg';
import dotsIcon from '../../assets/three-dots-vertical.svg';
import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Renders a view for displaying and editing a text snippet.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.textSnippet - The text snippet object, that contains
 *  properties like content, to display.
 * @param {Number} props.idx - Index of text snippet in the containing list of
 *  text snippets.  This is used for @hello-pangea/dnd.
 * @param {Boolean} props.addBullet - Whether to add a bullet point to the
 *  beginning of the text content.
 */
function TextSnippetCard({ textSnippet, idx, addBullet = true }) {
  const [document] = useContext(DocumentContext);
  const {
    replaceTextSnippetInDocumentState,
    detachTextSnippet,
    removeTextSnippetFromDocumentState,
  } = useContext(TextSnippetContext);

  const [isEditTextSnippetFormOpen, setIsEditTextSnippetFormOpen] =
    useState(false);

  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  /**
   * Sends an API request to update a text snippet.  Then calls a passed-down
   * function to update the relevant section in the document state.
   *
   * @param {Object} formData - Contains the updated text snippet properties or
   *  content.
   */
  async function editTextSnippet(formData) {
    let updatedTextSnippet;
    try {
      updatedTextSnippet = await ResumeManagerApi.updateTextSnippet(
        textSnippet.id,
        textSnippet.version,
        formData
      );

      // Removing owner property because it is not needed.
      delete updatedTextSnippet.owner;
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    replaceTextSnippetInDocumentState(updatedTextSnippet);

    setIsEditTextSnippetFormOpen(false);
  }

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

  // Convert current null fields in experience to empty Strings, so that they
  // are properly displayed in form inputs.
  const initialFormData = TEXT_SNIPPET_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = textSnippet[field.jsName] || '';
    return obj;
  }, {});

  return (
    <Draggable
      draggableId={`textSnippet-${textSnippet.id}-${textSnippet.version}`}
      index={idx}
    >
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card className="TextSnippetCard">
            <CardHeader className="text-end">
              {errorMessages.map((msg) => (
                <Alert key={msg} color="danger">
                  {msg}
                </Alert>
              ))}
              {document.isMaster && (
                <img
                  src={pencilIcon}
                  alt="edit icon"
                  onClick={() =>
                    setIsEditTextSnippetFormOpen(
                      (previousState) => !previousState
                    )
                  }
                />
              )}
              <img
                src={trashIcon}
                alt="trash icon"
                onClick={deleteTextSnippet}
              />
              <img
                src={dotsIcon}
                alt="reposition icon"
                {...provided.dragHandleProps}
              />
            </CardHeader>
            <CardBody className="text-start">
              {isEditTextSnippetFormOpen ? (
                <GenericForm
                  fields={TEXT_SNIPPET_FIELDS}
                  optionalFieldsStartIndex={
                    TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX
                  }
                  initialFormData={initialFormData}
                  processSubmission={editTextSnippet}
                />
              ) : (
                <>
                  {addBullet && <>&bull; </>}
                  {textSnippet.content}
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

// ==================================================

export default TextSnippetCard;
