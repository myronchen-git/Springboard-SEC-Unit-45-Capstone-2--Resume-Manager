import { useContext, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
} from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import { attachSectionItem } from '../../util/specificSectionsFuncs.js';

import TrashIcon from '../TrashIcon.jsx';

// ==================================================

function AttachEducationCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [educationId, setEducationId] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [availableEducations, setAvailableEducations] = useState(null);
  const [document, setDocument] = useContext(DocumentContext);

  // --------------------------------------------------

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setEducationId(null);
    setErrorMessages([]);

    if (!isRevealed && availableEducations === null)
      setAvailableEducations(await ResumeManagerApi.getEducations());
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setEducationId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (educationId) {
      const convertedEducationId = Number(educationId);

      try {
        const educationToAttach = availableEducations.find(
          (education) => education.id === convertedEducationId
        );

        const updatedDocument = await attachSectionItem(
          document,
          1,
          convertedEducationId,
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
    <Card tag="article">
      {isRevealed ? (
        <>
          <CardHeader tag="header">
            <span></span>
            <span></span>
            <span>
              <TrashIcon clickFunc={toggleOpen} />
            </span>
          </CardHeader>
          <CardBody tag="section">
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
                {availableEducations &&
                  availableEducations.map((education) => {
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
              <Button color="primary" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody tag="section" onClick={toggleOpen}>
          Attach Education
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AttachEducationCard;
