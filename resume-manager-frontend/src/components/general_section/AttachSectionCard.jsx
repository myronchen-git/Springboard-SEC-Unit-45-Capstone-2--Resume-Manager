import { useContext, useState } from 'react';
import { Button, Card, CardBody, CardHeader, Form, Input } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { AppContext } from '../../contexts.jsx';

import TrashIcon from '../TrashIcon.jsx';

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
  const { addAlert } = useContext(AppContext);

  const [isRevealed, setIsRevealed] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  const [availableSections, setAvailableSections] = useState(null);

  // --------------------------------------------------

  async function toggleOpen() {
    setIsRevealed(!isRevealed);
    setSectionId(null);

    if (!isRevealed && availableSections === null) {
      // setAvailableSections(await ResumeManagerApi.getSections());

      // Temporary exclusion of sections until they get implemented.
      const retrievedSections = await ResumeManagerApi.getSections();
      setAvailableSections(retrievedSections.slice(0, 2));
    }
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
        return err.forEach((message) => addAlert(message, 'danger'));
      }

      toggleOpen();
    }
  }

  // --------------------------------------------------

  return (
    <Card className="AttachSectionCard" tag="article">
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
