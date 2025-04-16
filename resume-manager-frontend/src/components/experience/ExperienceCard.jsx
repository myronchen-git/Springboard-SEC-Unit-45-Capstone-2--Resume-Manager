import { useCallback, useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import TextSnippetsList from '../text_snippet/TextSnippetsList.jsx';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Renders a view for displaying and editing an experience.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.item - The experience object, that contains properties
 *  like title and organization, to display.
 */
function ExperienceCard({ item: experience }) {
  const [document, setDocument] = useContext(DocumentContext);

  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  /**
   * If the document is the master resume, deletes the experience, that was
   * clicked on, from the database.
   *
   * If the document is not the master resume, removes the experience from the
   * document, but keeps the experience entry.
   *
   * Locally updates the document object in the app state.
   */
  async function deleteExperience() {
    try {
      if (document.isMaster) {
        await ResumeManagerApi.deleteExperience(experience.id);
      } else {
        await ResumeManagerApi.removeExperienceFromDocument(
          document.id,
          experience.id
        );
      }
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    // Clone Array to indicate to other components that it has been changed.
    document.experiences = [...document.experiences];

    // Find the experience in the document Object and remove it.
    const experienceIdx = document.experiences.findIndex(
      (experienceInDocument) => experienceInDocument.id == experience.id
    );
    document.experiences.splice(experienceIdx, 1);

    // Update document to re-render.
    setDocument({ ...document });
  }

  /**
   * Sends a request to the back-end to create a new text snippet for this
   * specific education and document, and updates the document Object / state.
   *
   * @param {Object} formData - The data required for creating a new text
   *  snippet.
   */
  const addTextSnippet = useCallback(
    async (formData) => {
      const { textSnippet } = await ResumeManagerApi.addTextSnippet(
        document.id,
        2,
        experience.id,
        formData
      );

      // Add text snippet to local version of experience. This mutates the
      // experience Object to save from having to find the experience again.
      // This is possible, because a shallow copy of the document will be
      // performed.  Note that a new Array is set for bullets to indicate to
      // other React components that there has been a change.
      experience.bullets
        ? (experience.bullets = [...experience.bullets, textSnippet])
        : (experience.bullets = [textSnippet]);

      // Update document with a clone to re-render. A shallow copy is done as a
      // quicker way of updating the document, instead of deep copying.
      setDocument({ ...document });
    },
    [document, setDocument, experience]
  );

  /**
   * Gets all text snippets for this experience.
   *
   * @returns {Object[]} A list of text snippet Objects, each containing info
   *  like content.
   */
  const getAvailableTextSnippets = useCallback(
    async () =>
      await ResumeManagerApi.getTextSnippetsForExperience(experience.id),
    [experience]
  );

  /**
   * Attaches a text snippet to an experience in a document.
   * Sends a request to the back-end to attach a text snippet to an experience
   * in a document and creates a document clone with the text snippet in it.
   * The clone will be used to update the document state locally, without having
   * to make another GET request.
   *
   * @param {String | Number} id - ID part of the text snippet to attach.
   * @param {String | Number} version - Version part of the text snippet to
   *  attach.
   * @param {Object} textSnippetToAttach - The text snippet Object retrieved
   *  from the back-end and selected in the AttachTextSnippetCard component.
   */
  const attachTextSnippet = useCallback(
    async (id, version, textSnippetToAttach) => {
      await ResumeManagerApi.attachTextSnippetToExperience(
        document.id,
        experience.id,
        id,
        version
      );

      // Add text snippet to local version of experience. This mutates the
      // experience Object to save from having to find the experience again.
      // This is possible, because a shallow copy of the document will be
      // performed.  Note that a new Array is set for bullets to indicate to
      // other React components that there has been a change.
      experience.bullets
        ? (experience.bullets = [...experience.bullets, textSnippetToAttach])
        : (experience.bullets = [textSnippetToAttach]);

      // Update document with a clone to re-render. A shallow copy is done as a
      // quicker way of updating the document, instead of deep copying.
      setDocument({ ...document });
    },
    [document, experience, setDocument]
  );

  /**
   * Removes a text snippet from this experience in the document state.
   *
   * @param {String | Number} textSnippetId - ID part of the text snippet to
   *  remove.
   */
  const removeTextSnippetFromDocumentState = useCallback(
    (textSnippetId) => {
      const documentClone = { ...document };

      // Replace experience because it's an input and to have this function
      // remain "pure".
      const experienceClone = { ...experience };
      const experienceIdx = documentClone.experiences.findIndex(
        (exp) => exp.id == experienceClone.id
      );
      documentClone.experiences[experienceIdx] = experienceClone;

      // Remove the text snippet.  Also make a clone of the bullets Array to
      // indicate to other components that it has been changed.
      experienceClone.bullets = experienceClone.bullets.filter(
        (textSnippet) => textSnippet.id != textSnippetId
      );

      // Update document to re-render.
      setDocument(documentClone);
    },
    [experience, document, setDocument]
  );

  const detachTextSnippet = useCallback(
    async (textSnippetId) => {
      await ResumeManagerApi.removeTextSnippetFromExperience(
        document.id,
        experience.id,
        textSnippetId
      );

      removeTextSnippetFromDocumentState(textSnippetId);
    },
    [document, experience, removeTextSnippetFromDocumentState]
  );

  // --------------------------------------------------

  return (
    <Card className="ExperienceCard">
      <CardHeader className="text-end">
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        <img src={trashIcon} alt="trash icon" onClick={deleteExperience} />
      </CardHeader>
      <CardBody>
        {experience.title}
        <br />
        {experience.organization}
        <br />
        {experience.location}
        <br />
        {experience.startDate}
        <br />
        {experience.endDate}
        <br />
        <TextSnippetsList
          textSnippets={experience.bullets}
          addTextSnippet={addTextSnippet}
          getAvailableTextSnippets={getAvailableTextSnippets}
          attachTextSnippet={attachTextSnippet}
          detachTextSnippet={detachTextSnippet}
          removeTextSnippetFromDocumentState={
            removeTextSnippetFromDocumentState
          }
        />
      </CardBody>
    </Card>
  );
}

// ==================================================

export default ExperienceCard;
