import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';

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
      </CardBody>
    </Card>
  );
}

// ==================================================

export default ExperienceCard;
