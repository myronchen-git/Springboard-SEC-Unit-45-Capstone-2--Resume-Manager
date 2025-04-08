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

/**
 * Renders a card, that will be listed after all other sections, to allow adding
 * a predefined section to a document.
 *
 * @param {Object} props - React component properties.
 * @param {Object[]} props.availableSections - A list of section Objects,
 *  representing the available sections that can be added to a document.
 * @param {Number} props.availableSections[].id - ID of the section.
 * @param {String} props.availableSections[].sectionName - Name of the section,
 *  which can be used to display to users.
 * @param {Function} props.addSection - Accepts a section ID and adds the
 *  affiliated section to the document.
 */
function AddSectionCard({ availableSections, addSection }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  function toggleOpen() {
    setIsRevealed(!isRevealed);
    setSectionId(null);
    setErrorMessages([]);
  }

  function handleChange(evt) {
    const { value } = evt.target;
    setSectionId(value);
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    if (sectionId) {
      try {
        await addSection(sectionId);
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
            <img src={trashIcon} alt="trash icon" />
          </CardHeader>
          <CardBody>
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
                {availableSections.map((section) => {
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
              <Button color="light" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody onClick={toggleOpen}>
          Add Section
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddSectionCard;
