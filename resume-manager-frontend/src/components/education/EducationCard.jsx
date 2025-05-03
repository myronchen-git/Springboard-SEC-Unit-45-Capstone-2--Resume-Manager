import { Draggable } from '@hello-pangea/dnd';
import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import GenericForm from '../GenericForm.jsx';
import EducationText from './EducationText.jsx';

import {
  EDUCATION_FIELDS,
  EDUCATION_OPTIONAL_FIELDS_START_INDEX,
} from '../../commonData.js';

import dotsIcon from '../../assets/grip-horizontal.svg';
import pencilIcon from '../../assets/pencil.svg';
import TrashIcon from '../TrashIcon.jsx';

// ==================================================

/**
 * Renders a view for displaying and editing an education.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.item - The education object, that contains properties
 *  like school name and location, to display.
 * @param {Number} props.idx - Index of education in the list of educations.
 *  This is used for @hello-pangea/dnd.
 */
function EducationCard({ item: education, idx }) {
  const [document, setDocument] = useContext(DocumentContext);
  const [isEditEducationFormOpen, setIsEditEducationFormOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  /**
   * Sends an API request to update an education's properties.  Then updates the
   * list of educations with the returned updated info.
   *
   * @param {Object} formData - Holds updated education properties.
   * @see ResumeManagerApi.updateEducation for formData properties.
   */
  async function editEducation(formData) {
    const updatedEducation = await ResumeManagerApi.updateEducation(
      document.id,
      education.id,
      formData
    );

    // Removing owner property because it is not necessary.
    delete updatedEducation.owner;

    // Clone to indicate to React that things were changed.
    const documentClone = { ...document, educations: [...document.educations] };

    // Find the education in the document Object and replace it.
    const educationIdx = documentClone.educations.findIndex(
      (educationInDocument) => educationInDocument.id == education.id
    );
    documentClone.educations[educationIdx] = updatedEducation;

    // Update document to re-render.
    setDocument(documentClone);

    setIsEditEducationFormOpen(false);
  }

  /**
   * If the document is the master resume, deletes the education, that was
   * clicked on, from the database.
   *
   * If the document is not the master resume, removes the education from the
   * document, but keeps the education entry.
   *
   * Locally updates the document object in the app state.
   */
  async function deleteEducation() {
    try {
      if (document.isMaster) {
        await ResumeManagerApi.deleteEducation(education.id);
      } else {
        await ResumeManagerApi.removeEducationFromDocument(
          document.id,
          education.id
        );
      }
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    // Clone Array to indicate to other components that it has been changed.
    document.educations = [...document.educations];

    // Find the education in the document Object and remove it.
    const educationIdx = document.educations.findIndex(
      (educationInDocument) => educationInDocument.id == education.id
    );
    document.educations.splice(educationIdx, 1);

    // Update document to re-render.
    setDocument({ ...document });
  }

  // --------------------------------------------------

  // Convert current null fields in education to empty Strings, so that they are
  // properly displayed in form inputs.
  const initialFormData = EDUCATION_FIELDS.reduce((obj, field) => {
    obj[field.jsName] = education[field.jsName] || '';
    return obj;
  }, {});

  return (
    <Draggable draggableId={'education-' + education.id} index={idx}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card className="EducationCard" tag="article">
            <CardHeader tag="header">
              {errorMessages.map((msg) => (
                <Alert key={msg} color="danger">
                  {msg}
                </Alert>
              ))}
              <span></span>
              <span>
                <img
                  src={dotsIcon}
                  alt="reposition icon"
                  {...provided.dragHandleProps}
                />
              </span>
              <span>
                {document.isMaster && (
                  <div
                    className="clickable-icon"
                    onClick={() =>
                      setIsEditEducationFormOpen(
                        (previousState) => !previousState
                      )
                    }
                  >
                    <img src={pencilIcon} alt="edit icon" />
                  </div>
                )}
                <TrashIcon clickFunc={deleteEducation} />
              </span>
            </CardHeader>
            <CardBody
              className={
                isEditEducationFormOpen
                  ? 'section-item-edit-form'
                  : 'section-item-text'
              }
              tag="section"
            >
              {isEditEducationFormOpen ? (
                <GenericForm
                  fields={EDUCATION_FIELDS}
                  optionalFieldsStartIndex={
                    EDUCATION_OPTIONAL_FIELDS_START_INDEX
                  }
                  initialFormData={initialFormData}
                  processSubmission={editEducation}
                />
              ) : (
                <EducationText education={education} />
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

// ==================================================

export default EducationCard;
