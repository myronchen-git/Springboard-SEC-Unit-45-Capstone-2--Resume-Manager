import { useContext, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Form, Input } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { AppContext, DocumentContext } from '../../contexts.jsx';
import { attachSectionItem } from '../../util/specificSectionsFuncs.js';

import TrashIcon from '../TrashIcon.jsx';

// ==================================================

function AttachExperienceCard() {
  const { addAlert } = useContext(AppContext);
  const [document, setDocument] = useContext(DocumentContext);

  const [isRevealed, setIsRevealed] = useState(false);
  const [experienceId, setExperienceId] = useState(null);
  const [availableExperiences, setAvailableExperiences] = useState(null);

  // --------------------------------------------------

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setExperienceId(null);

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
        return err.forEach((message) => addAlert(message, 'danger'));
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
              <Button color="primary" type="submit">
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
