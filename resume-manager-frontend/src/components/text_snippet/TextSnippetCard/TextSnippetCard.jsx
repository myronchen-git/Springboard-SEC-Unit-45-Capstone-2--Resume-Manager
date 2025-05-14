import { Draggable } from '@hello-pangea/dnd';
import { useContext, useState } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../../../api.js';
import {
  TEXT_SNIPPET_FIELDS,
  TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX,
} from '../../../commonData.js';
import {
  AppContext,
  DocumentContext,
  TextSnippetContext,
} from '../../../contexts.jsx';
import GenericForm from '../../GenericForm/GenericForm.jsx';

import dotsIcon from '../../../assets/grip-horizontal.svg';
import pencilIcon from '../../../assets/pencil.svg';
import TrashIcon from '../../TrashIcon/TrashIcon.jsx';

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
  const { addAlert } = useContext(AppContext);

  const [document] = useContext(DocumentContext);
  const {
    updateTextSnippet,
    detachTextSnippet,
    removeTextSnippetFromDocumentState,
  } = useContext(TextSnippetContext);

  const [isEditTextSnippetFormOpen, setIsEditTextSnippetFormOpen] =
    useState(false);

  // --------------------------------------------------

  /**
   * Edits a text snippet by calling a passed-down function.
   *
   * @param {Object} formData - Contains the updated text snippet properties or
   *  content.
   */
  async function editTextSnippet(formData) {
    try {
      await updateTextSnippet(textSnippet, formData);
    } catch (err) {
      return err.forEach((message) => addAlert(message, 'danger'));
    }

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
      return err.forEach((message) => addAlert(message, 'danger'));
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
          <Card className="TextSnippetCard" tag="article">
            <CardHeader tag="header">
              <span></span>
              <span>
                <img
                  src={dotsIcon}
                  alt="reposition icon"
                  {...provided.dragHandleProps}
                />
              </span>
              <span>
                {document.isMaster && (
                  <div
                    className="clickable-icon"
                    onClick={() =>
                      setIsEditTextSnippetFormOpen(
                        (previousState) => !previousState
                      )
                    }
                  >
                    <img src={pencilIcon} alt="edit icon" />
                  </div>
                )}
                <TrashIcon clickFunc={deleteTextSnippet} />
              </span>
            </CardHeader>
            <CardBody className="text-start" tag="section">
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
