import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';

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
  const [document, setDocument] = useContext(DocumentContext);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  /**
   * If the document is the master resume, deletes the education, that was
   * clicked on, from the database.
   *
   * If the document is not the master resume, removes the education from the
   * document, but keeps the education entry.
   *
   * Locally updates the document object in the app state.
   */
  async function deleteEducation() {
    try {
      if (document.isMaster) {
        await ResumeManagerApi.deleteEducation(education.id);
      } else {
        await ResumeManagerApi.removeEducationFromDocument(
          document.id,
          education.id
        );
      }
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    // Clone Array to indicate to other components that it has been changed.
    document.educations = [...document.educations];

    // Find the education in the document Object and remove it.
    const educationIdx = document.educations.findIndex(
      (educationInDocument) => educationInDocument.id == education.id
    );
    document.educations.splice(educationIdx, 1);

    // Update document to re-render.
    setDocument({ ...document });
  }

  // --------------------------------------------------

  return (
    <Card className="EducationCard">
      <CardHeader className="text-end">
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        <img src={trashIcon} alt="trash icon" onClick={deleteEducation} />
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
