import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from 'reactstrap';

import trashIcon from '../assets/trash.svg';

// ==================================================

function AttachEducationCard({
  availableItems: availableEducations,
  attachItem: attachEducation,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [educationId, setEducationId] = useState(null);
  const [errorMessages, setErrorMessages] = useState(null);

  // --------------------------------------------------

  function toggleOpen() {
    setIsRevealed(!isRevealed);
    setEducationId(null);
    setErrorMessages(null);
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setEducationId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (educationId) {
      try {
        await attachEducation(educationId);
      } catch (err) {
        setErrorMessages(err);
        return;
      }

      toggleOpen();
    }
  }

  // --------------------------------------------------

  return (
    <Card>
      {isRevealed ? (
        <>
          <CardHeader className="text-end" onClick={toggleOpen}>
            {<img src={trashIcon} alt="trash icon" />}
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <Input
                type="select"
                name="educationId"
                defaultValue=""
                onChange={handleChange}
              >
                <option value="" disabled>
                  Choose an education
                </option>
                {availableEducations.map((education) => {
                  return (
                    <option key={education.id} value={education.id}>
                      {`${education.school}, ${education.degree}`}
                    </option>
                  );
                })}
              </Input>
              {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
              <Button color="light" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody onClick={toggleOpen}>
          Attach Education
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AttachEducationCard;
