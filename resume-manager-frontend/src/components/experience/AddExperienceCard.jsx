import { useContext, useState } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';

import {
  EXPERIENCE_FIELDS,
  EXPERIENCE_OPTIONAL_FIELDS_START_INDEX,
} from '../../commonData.js';
import { DocumentContext } from '../../contexts.jsx';
import { addNewSectionItem } from '../../util/specificSectionsFuncs.js';
import GenericForm from '../GenericForm.jsx';

import trashIcon from '../../assets/trash.svg';

// ==================================================

/**
 * Component for showing and controlling the form to add a new experience entry.
 */
function AddExperienceCard() {
  const [document, setDocument] = useContext(DocumentContext);
  const [isAddExperienceFormOpen, setIsAddExperienceFormOpen] = useState(false);

  // --------------------------------------------------

  /**
   * Sends an API request to create a new experience.  Then updates the document
   * with the new experience's info.
   *
   * @param {Object} formData - Holds the data for creating a new experience.
   * @see ResumeManagerApi.addExperience for formData properties.
   */
  async function addExperience(formData) {
    // Removing fields with empty Strings, so that the back-end does not assume
    // a user is trying to update particular fields.
    const formDataCopy = { ...formData };
    for (const prop in formDataCopy) {
      if (!formDataCopy[prop]) delete formDataCopy[prop];
    }

    const updatedDocument = await addNewSectionItem(document, 2, formDataCopy);

    setDocument(updatedDocument);

    setIsAddExperienceFormOpen(false);
  }

  // --------------------------------------------------

  const initialFormData = EXPERIENCE_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = '';
    return obj;
  }, {});

  return (
    <Card className="AddExperienceCard" tag="article">
      {isAddExperienceFormOpen ? (
        <>
          <CardHeader tag="header">
            <span></span>
            <span></span>
            <span>
              <div
                className="clickable-icon"
                onClick={() => setIsAddExperienceFormOpen(false)}
              >
                <img src={trashIcon} alt="trash icon" />
              </div>
            </span>
          </CardHeader>
          <CardBody tag="section">
            <GenericForm
              fields={EXPERIENCE_FIELDS}
              optionalFieldsStartIndex={EXPERIENCE_OPTIONAL_FIELDS_START_INDEX}
              initialFormData={initialFormData}
              processSubmission={addExperience}
            />
          </CardBody>
        </>
      ) : (
        <CardBody
          tag="section"
          onClick={() => setIsAddExperienceFormOpen(true)}
        >
          Add Experience
          <br />+
        </CardBody>
      )}
    </Card>
  );
}

// ==================================================

export default AddExperienceCard;
