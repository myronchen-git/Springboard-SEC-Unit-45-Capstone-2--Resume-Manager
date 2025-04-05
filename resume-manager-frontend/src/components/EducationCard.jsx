import { Card, CardBody } from 'reactstrap';

// ==================================================

/**
 * Renders a view for displaying and editing an education.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.item - The education object, that contains properties
 *  like school name and location, to display.
 */
function EducationCard({ item }) {
  return (
    <Card>
      <CardBody>
        {item.school}
        <br />
        {item.location}
        <br />
        {item.startDate}
        <br />
        {item.endDate}
        <br />
        {item.degree}
        <br />
        {item.gpa}
        <br />
        {item.awardsAndHonors}
        <br />
        {item.activities}
        <br />
      </CardBody>
    </Card>
  );
}

// ==================================================

export default EducationCard;
