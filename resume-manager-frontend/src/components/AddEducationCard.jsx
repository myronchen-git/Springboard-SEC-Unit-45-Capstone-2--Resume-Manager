import { useContext, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import { DocumentContext } from '../contexts.jsx';
import { addNewSectionItem } from '../util/specificSectionsFuncs.js';

import trashIcon from '../assets/trash.svg';

// ==================================================

/**
 * Component for showing and controlling the form to add a new education entry.
 */
function AddEducationCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const initialFormData = {
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    degree: '',
    gpa: '',
    awardsAndHonors: '',
    activities: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState(null);
  const [document, setDocument] = useContext(DocumentContext);

  // --------------------------------------------------

  function toggleOpen() {
    setIsRevealed(!isRevealed);
    setFormData(initialFormData);
    setErrorMessages(null);
  }

  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData((formData) => ({ ...formData, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    // Removing fields with empty Strings, so that the back-end does not assume
    // a user is trying to update particular fields.
    const formDataCopy = { ...formData };
    for (const prop in formDataCopy) {
      if (!formDataCopy[prop]) delete formDataCopy[prop];
    }

    try {
      const updatedDocument = await addNewSectionItem(
        document,
        1,
        formDataCopy
      );
      setDocument(updatedDocument);
    } catch (err) {
      setErrorMessages(err);
      return;
    }

    toggleOpen();
  }

  // --------------------------------------------------

  // Used for reducing duplicate code for inputs.  Always keep up to date, with
  // optional fields last!
  // [JavaScript name, user-facing name]
  const fields = [
    ['school', 'School Name'],
    ['location', 'Location'],
    ['startDate', 'Start Date'],
    ['endDate', 'End Date'],
    ['degree', 'Degree'],
    ['gpa', 'GPA'],
    ['awardsAndHonors', 'Awards And Honors'],
    ['activities', 'Activities'],
  ];

  // Always keep up to date!
  const optionalFieldsStartIndex = 5;

  const getRequiredIndicator = (idx) => idx < optionalFieldsStartIndex && ' *';
  const getPlaceholder = (fieldName) =>
    fieldName.toLowerCase().includes('date') ? 'YYYY-MM-DD' : '';
  const getPattern = (fieldName) =>
    fieldName.toLowerCase().includes('date')
      ? '^\\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$'
      : '.*';

  return (
    <Card className="AddEducationCard">
      {isRevealed ? (
        <>
          <CardHeader className="text-end" onClick={toggleOpen}>
            {<img src={trashIcon} alt="trash icon" />}
          </CardHeader>
          <CardBody>
            <Form className="AddEducationCard__form" onSubmit={handleSubmit}>
              {fields.map((field, idx) => (
                <FormGroup key={field[0]} className="text-start">
                  <Label htmlFor={`AddEducationCard__input-${field[0]}`}>
                    <b>{field[1]}</b>
                    {getRequiredIndicator(idx)}
                  </Label>
                  <Input
                    id={`AddEducationCard__input-${field[0]}`}
                    type="text"
                    name={field[0]}
                    placeholder={getPlaceholder(field[0])}
                    pattern={getPattern(field[0])}
                    value={formData[field[0]]}
                    required={idx < optionalFieldsStartIndex}
                    onChange={handleChange}
                  />
                </FormGroup>
              ))}
              {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
              <Button color="light" type="submit">
                Add
              </Button>
            </Form>
          </CardBody>
        </>
      ) : (
        <CardBody onClick={toggleOpen}>
          Add Education
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddEducationCard;
