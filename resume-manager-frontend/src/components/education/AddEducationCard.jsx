import { useContext, useState } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import { DocumentContext } from '../../contexts.jsx';
import { addNewSectionItem } from '../../util/specificSectionsFuncs.js';
import EducationForm from './EducationForm.jsx';

import { EDUCATION_FIELDS } from '../../commonData.js';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Component for showing the form to add a new education entry.
 */
function AddEducationCard() {
  const [document, setDocument] = useContext(DocumentContext);
  const [isEducationFormOpen, setIsEducationFormOpen] = useState(false);

  // --------------------------------------------------

  /**
   * Sends an API request to create a new education.  Then updates the document
   * with the new education's info.
   *
   * @param {Object} formData - Holds the data for creating a new education.
   * @see ResumeManagerApi.addEducation for formData properties.
   */
  async function addEducation(formData) {
    // Removing fields with empty Strings, so that the back-end does not assume
    // a user is trying to set particular fields.
    const formDataCopy = { ...formData };
    for (const prop in formDataCopy) {
      if (!formDataCopy[prop]) delete formDataCopy[prop];
    }

    const updatedDocument = await addNewSectionItem(document, 1, formDataCopy);

    setDocument(updatedDocument);

    setIsEducationFormOpen(false);
  }

  // --------------------------------------------------

  const initialFormData = EDUCATION_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = '';
    return obj;
  }, {});

  return (
    <Card className="AddEducationCard">
      {isEducationFormOpen ? (
        <>
          <CardHeader className="text-end">
            <img
              src={trashIcon}
              alt="trash icon"
              onClick={() => setIsEducationFormOpen(false)}
            />
          </CardHeader>
          <CardBody>
            <EducationForm
              initialFormData={initialFormData}
              processSubmission={addEducation}
            />
          </CardBody>
        </>
      ) : (
        <CardBody onClick={() => setIsEducationFormOpen(true)}>
          Add Education
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddEducationCard;
