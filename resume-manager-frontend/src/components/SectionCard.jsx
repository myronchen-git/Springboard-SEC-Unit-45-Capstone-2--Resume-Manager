import { useContext, useEffect, useState } from 'react';
import { Alert, Card, CardBody, CardHeader, CardTitle } from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';
import AddEducationCard from './AddEducationCard';
import AttachEducationCard from './AttachEducationCard.jsx';
import EducationCard from './EducationCard';

import trashIcon from '../assets/trash.svg';

// ==================================================

/**
 * Renders a card that contains the section name and its contents.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.section - Contains generic section info.
 * @param {Number} props.section.id - ID number of section.
 * @param {String} props.section.sectionName - Name of the section for
 *  displaying on document.
 * @param {Object[]} props.items - The items of a section, such as individual
 *  educations or experiences.
 */
function SectionCard({ section, items }) {
  const [availableEducations, setAvailableEducations] = useState([]);
  const [document, setDocument] = useContext(DocumentContext);
  const [errorMessages, setErrorMessages] = useState(null);

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      setAvailableEducations(await ResumeManagerApi.getEducations());
    }

    runEffect();
  }, []);

  // --------------------------------------------------

  /**
   * Removes a section from a document.  In other words, this deletes a
   * document-section relationship.
   *
   * @param {Event} evt - The click event of the HTML element with a parent two
   *  levels up, where the parent contains the "id" data attribute for the
   *  section ID.
   */
  async function deleteSection(evt) {
    const sectionId = evt.target.parentElement.parentElement.dataset.id;

    try {
      await ResumeManagerApi.deleteSection(document.id, sectionId);
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages(null), 5000);
      return;
    }

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Find the section in the document Object and remove it.
    const sectionIdx = documentClone.sections.findIndex(
      (section) => section.id == sectionId
    );
    documentClone.sections.splice(sectionIdx, 1);

    setDocument(documentClone);
  }

  /**
   * Sends a request to the back-end to save a new education.  Then locally
   * updates the document Object to avoid making a network call, though this
   * may cause desync issues.
   *
   * @param {Object} formData - Holds the data for creating a new education.
   * @see ResumeManagerApi.addEducation for formData properties.
   */
  async function addEducation(formData) {
    const { education: newEducation } = await ResumeManagerApi.addEducation(
      document.id,
      formData
    );

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Add the new section Object to document.sections if it exists, otherwise
    // create a new sections property.
    if (documentClone.educations) {
      documentClone.educations.push(newEducation);
    } else {
      documentClone.educations = [newEducation];
    }

    setDocument(documentClone);
  }

  async function attachEducation(educationId) {
    await ResumeManagerApi.attachEducationToDocument(document.id, educationId);

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Find the chosen eduction Object.
    const educationToAttach = availableEducations.find(
      (education) => education.id == educationId
    );

    // Add the education Object to document.educations if it exists, otherwise
    // create a new educations property.
    if (documentClone.educations) {
      documentClone.educations.push(educationToAttach);
    } else {
      documentClone.educations = [educationToAttach];
    }

    setDocument(documentClone);
  }

  // --------------------------------------------------

  // Holds the components that can be used to display a section item.
  // Section IDs are the index positions.
  const sectionComponents = [null, EducationCard];
  const addSectionComponents = [null, AddEducationCard];
  const attachSectionComponents = [null, AttachEducationCard];

  // Holds the functions for section items.
  // Section IDs are the index positions.
  const addSectionItemFuncs = [null, addEducation];
  const attachSectionItemFuncs = [null, attachEducation];

  const availableItemsList = [null, availableEducations];

  // Code for creating components stored here.
  // Note that section.id must be an integer > 0.
  const SectionComponent = sectionComponents[section.id];
  const renderedItems =
    SectionComponent == undefined
      ? null
      : items.map((item) => <SectionComponent key={item.id} item={item} />);

  function renderAddItemForm(sectionId) {
    // Note that sectionId must be an integer > 0.
    const AddSectionComponent = addSectionComponents[sectionId];
    return AddSectionComponent == undefined ? null : (
      <AddSectionComponent addItem={addSectionItemFuncs[sectionId]} />
    );
  }

  function renderAttachItemForm(sectionId) {
    // Note that sectionId must be an integer > 0.
    const AttachSectionComponent = attachSectionComponents[sectionId];
    return AttachSectionComponent == undefined ? null : (
      <AttachSectionComponent
        availableItems={availableItemsList[sectionId]}
        attachItem={attachSectionItemFuncs[sectionId]}
      />
    );
  }

  // --------------------------------------------------

  return (
    <Card className="SectionCard text-center" data-id={section.id}>
      <CardHeader className="text-end" onClick={deleteSection}>
        {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
        {<img src={trashIcon} alt="trash icon" />}
      </CardHeader>
      <CardBody>
        <CardTitle>{section.sectionName}</CardTitle>
        {renderedItems}
        {document.isMaster
          ? renderAddItemForm(section.id)
          : renderAttachItemForm(section.id)}
      </CardBody>
    </Card>
  );
}

// ==================================================

export default SectionCard;
