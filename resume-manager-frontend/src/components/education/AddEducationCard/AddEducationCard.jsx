import { useContext, useState } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import { DocumentContext } from '../../../contexts.jsx';
import { addNewSectionItem } from '../../../util/specificSectionsFuncs.js';
import GenericForm from '../../GenericForm/GenericForm.jsx';

import {
  EDUCATION_FIELDS,
  EDUCATION_OPTIONAL_FIELDS_START_INDEX,
} from '../../../commonData.js';

import TrashIcon from '../../TrashIcon/TrashIcon.jsx';

// ==================================================

/**
 * Component for showing the form to add a new education entry.
 */
function AddEducationCard() {
  const [document, setDocument] = useContext(DocumentContext);
  const [isAddEducationFormOpen, setIsAddEducationFormOpen] = useState(false);

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

    setIsAddEducationFormOpen(false);
  }

  // --------------------------------------------------

  const initialFormData = EDUCATION_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = '';
    return obj;
  }, {});

  return (
    <Card className="AddEducationCard" tag="article">
      {isAddEducationFormOpen ? (
        <>
          <CardHeader tag="header">
            <span></span>
            <span></span>
            <span>
              <TrashIcon clickFunc={() => setIsAddEducationFormOpen(false)} />
            </span>
          </CardHeader>
          <CardBody tag="section">
            <GenericForm
              fields={EDUCATION_FIELDS}
              optionalFieldsStartIndex={EDUCATION_OPTIONAL_FIELDS_START_INDEX}
              initialFormData={initialFormData}
              processSubmission={addEducation}
            />
          </CardBody>
        </>
      ) : (
        <CardBody tag="section" onClick={() => setIsAddEducationFormOpen(true)}>
          Add Education
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddEducationCard;
