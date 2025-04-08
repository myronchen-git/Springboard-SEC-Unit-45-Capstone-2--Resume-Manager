import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader, CardTitle } from 'reactstrap';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';
import SectionItemsList from './SectionItemsList.jsx';

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
 */
function SectionCard({ section }) {
  const [document, setDocument] = useContext(DocumentContext);
  const [errorMessages, setErrorMessages] = useState(null);

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

  // --------------------------------------------------

  return (
    <Card className="SectionCard text-center" data-id={section.id}>
      <CardHeader className="text-end" onClick={deleteSection}>
        {errorMessages && <Alert color="danger">{errorMessages}</Alert>}
        <img src={trashIcon} alt="trash icon" />
      </CardHeader>
      <CardBody>
        <CardTitle>{section.sectionName}</CardTitle>
        <SectionItemsList sectionId={section.id} />
      </CardBody>
    </Card>
  );
}

// ==================================================

export default SectionCard;
