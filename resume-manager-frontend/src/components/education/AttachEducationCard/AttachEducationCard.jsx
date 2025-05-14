import { useContext, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Form, Input } from 'reactstrap';

import ResumeManagerApi from '../../../api.js';
import { AppContext, DocumentContext } from '../../../contexts.jsx';
import { attachSectionItem } from '../../../util/specificSectionsFuncs.js';

import TrashIcon from '../../TrashIcon/TrashIcon.jsx';

// ==================================================

function AttachEducationCard() {
  const { addAlert } = useContext(AppContext);
  const [document, setDocument] = useContext(DocumentContext);

  const [isRevealed, setIsRevealed] = useState(false);
  const [educationId, setEducationId] = useState(null);
  const [availableEducations, setAvailableEducations] = useState(null);

  // --------------------------------------------------

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setEducationId(null);

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
