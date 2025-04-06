import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext, UserContext } from '../contexts.jsx';

import trashIcon from '../assets/trash.svg';

// ==================================================

/**
 * Renders a view for displaying and editing an education.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.item - The education object, that contains properties
 *  like school name and location, to display.
 */
function EducationCard({ item: education }) {
  const { user } = useContext(UserContext);
  const [document, setDocument] = useContext(DocumentContext);
  const [errorMessages, setErrorMessages] = useState(null);

  // --------------------------------------------------

  /**
   * If the document is the master resume, deletes the education, that was
   * clicked on, from the database.
   *
   * If the document is not the master resume, removes the education from the
   * document, but keeps the education entry.
   *
   * Locally updates the document object in the app state.
   *
   * @param {Event} evt - The click event, which contains an HTML element that
   *  has a parent two levels up with an "id" data attribute for the education
   *  ID.
   */
  async function deleteEducation(evt) {
    const educationId = evt.target.parentElement.parentElement.dataset.id;

    try {
      if (document.isMaster) {
        await ResumeManagerApi.deleteEducation(user.username, educationId);
      } else {
        await ResumeManagerApi.removeEducationFromDocument(
          user.username,
          document.id,
          educationId
        );
      }
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages(null), 5000);
      return;
    }

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Find the education in the document Object and remove it.
    const educationIdx = documentClone.educations.findIndex(
      (education) => education.id == educationId
    );
    documentClone.educations.splice(educationIdx, 1);

    // Update document.
    setDocument(documentClone);
  }

  // --------------------------------------------------

  return (
    <Card className="EducationCard" data-id={education.id}>
      <CardHeader className="text-end" onClick={deleteEducation}>
        {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
        {<img src={trashIcon} alt="trash icon" />}
      </CardHeader>
      <CardBody>
        {education.school}
        <br />
        {education.location}
        <br />
        {education.startDate}
        <br />
        {education.endDate}
        <br />
        {education.degree}
        <br />
        {education.gpa}
        <br />
        {education.awardsAndHonors}
        <br />
        {education.activities}
        <br />
      </CardBody>
    </Card>
  );
}

// ==================================================

export default EducationCard;
