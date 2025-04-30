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

import trashIcon from '../../assets/trash.svg';

// ==================================================

function AttachExperienceCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [experienceId, setExperienceId] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [availableExperiences, setAvailableExperiences] = useState(null);
  const [document, setDocument] = useContext(DocumentContext);

  // --------------------------------------------------

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setExperienceId(null);
    setErrorMessages([]);

    if (!isRevealed && availableExperiences === null)
      setAvailableExperiences(await ResumeManagerApi.getExperiences());
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setExperienceId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (experienceId) {
      const convertedExperienceId = Number(experienceId);

      try {
        const experienceToAttach = availableExperiences.find(
          (experience) => experience.id === convertedExperienceId
        );

        const updatedDocument = await attachSectionItem(
          document,
          2,
          convertedExperienceId,
          experienceToAttach
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
              <div className="clickable-icon" onClick={toggleOpen}>
                <img src={trashIcon} alt="trash icon" />
              </div>
            </span>
          </CardHeader>
          <CardBody tag="section">
            <Form onSubmit={handleSubmit}>
              <Input
                type="select"
                name="experienceId"
                defaultValue=""
                onChange={handleChange}
              >
                <option value="" disabled>
                  Choose an experience
                </option>
                {availableExperiences &&
                  availableExperiences.map((experience) => {
                    return (
                      <option key={experience.id} value={experience.id}>
                        {`${experience.organization} - ${experience.title} (${
                          experience.startDate
                        } ... ${experience.endDate || ''})`}
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
        <CardBody tag="section" onClick={toggleOpen}>
          Attach Experience
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AttachExperienceCard;
