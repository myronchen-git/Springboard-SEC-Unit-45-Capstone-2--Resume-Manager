import { useCallback, useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';
import TextSnippetsList from './TextSnippetsList.jsx';

import trashIcon from '../assets/trash.svg';

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
   *
   * @param {Event} evt - The click event of the HTML element with a parent that
   *  has the "id" data attribute for the experience ID.
   */
  async function deleteExperience(evt) {
    const experienceId = evt.target.closest('.ExperienceCard').dataset.id;

    try {
      if (document.isMaster) {
        await ResumeManagerApi.deleteExperience(experienceId);
      } else {
        await ResumeManagerApi.removeExperienceFromDocument(
          document.id,
          experienceId
        );
      }
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Find the experience in the document Object and remove it.
    const experienceIdx = documentClone.experiences.findIndex(
      (experience) => experience.id == experienceId
    );
    documentClone.experiences.splice(experienceIdx, 1);

    // Update document.
    setDocument(documentClone);
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

      // Clone document so that React sees the document state has been modified.
      // A shallow copy is done as a shortcut for updating the document by
      // allowing the bullets property of the experience argument to be mutated.
      // This saves from having to find the experience again.
      const documentCopy = { ...document };

      experience.bullets
        ? experience.bullets.push(textSnippet)
        : (experience.bullets = [textSnippet]);

      // Update document.
      setDocument(documentCopy);
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

  // --------------------------------------------------

  return (
    <Card className="ExperienceCard" data-id={experience.id}>
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
        />
      </CardBody>
    </Card>
  );
}

// ==================================================

export default ExperienceCard;
