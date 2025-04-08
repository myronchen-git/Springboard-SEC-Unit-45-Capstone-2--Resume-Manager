import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';
import { attachSectionItem } from '../util/specificSectionsFuncs.js';

import trashIcon from '../assets/trash.svg';

// ==================================================

function AttachEducationCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [educationId, setEducationId] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [availableEducations, setAvailableEducations] = useState([]);
  const [document, setDocument] = useContext(DocumentContext);

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      setAvailableEducations(await ResumeManagerApi.getEducations());
    }

    runEffect();
  }, []);

  // --------------------------------------------------

  function toggleOpen() {
    setIsRevealed(!isRevealed);
    setEducationId(null);
    setErrorMessages([]);
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setEducationId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (educationId) {
      try {
        const educationToAttach = availableEducations.find(
          (education) => education.id == educationId
        );

        const updatedDocument = await attachSectionItem(
          document,
          1,
          educationId,
          educationToAttach
        );

        setDocument(updatedDocument);
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
          <CardHeader className="text-end">
            <img src={trashIcon} alt="trash icon" onClick={toggleOpen} />
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
              {errorMessages.map((msg) => (
                <Alert key={msg} color="danger">
                  {msg}
                </Alert>
              ))}
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
