import { useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

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
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  return (
    <Card className="ExperienceCard" data-id={experience.id}>
      <CardHeader className="text-end">
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        <img src={trashIcon} alt="trash icon" />
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
