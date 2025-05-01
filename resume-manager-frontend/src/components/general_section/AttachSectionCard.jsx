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

import ResumeManagerApi from '../../api.js';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Renders a card, that will be listed after all other sections, to allow
 * attaching a predefined section to a document.
 *
 * @param {Object} props - React component properties.
 * @param {Function} props.attachSection - Accepts a section ID and a section
 *  Object and attaches the affiliated section to the document.
 */
function AttachSectionCard({ attachSection }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  const [availableSections, setAvailableSections] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setSectionId(null);
    setErrorMessages([]);

    if (!isRevealed && availableSections === null)
      setAvailableSections(await ResumeManagerApi.getSections());
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setSectionId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (sectionId) {
      const convertedSectionId = Number(sectionId);

      try {
        const sectionToAttach = availableSections.find(
          (section) => section.id === convertedSectionId
        );

        await attachSection(convertedSectionId, sectionToAttach);
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
                name="sectionId"
                defaultValue=""
                onChange={handleChange}
              >
                <option value="" disabled>
                  Choose a section
                </option>
                {availableSections &&
                  availableSections.map((section) => {
                    return (
                      <option key={section.id} value={section.id}>
                        {section.sectionName}
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
          Attach Section
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AttachSectionCard;
