import { useContext, useState } from 'react';
import { Alert, Card, CardBody, CardHeader, CardTitle } from 'reactstrap';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import SectionItemsList from './SectionItemsList.jsx';

import trashIcon from '../../assets/trash.svg';

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
  const [errorMessages, setErrorMessages] = useState([]);

  // --------------------------------------------------

  /**
   * Removes a section from a document.  In other words, this deletes a
   * document-section relationship.
   */
  async function deleteSection() {
    try {
      await ResumeManagerApi.deleteSection(document.id, section.id);
    } catch (err) {
      setErrorMessages(err);
      setTimeout(() => setErrorMessages([]), 5000);
      return;
    }

    // Clone Array to indicate to other components that it has been changed.
    document.sections = [...document.sections];

    // Find the section in the document Object and remove it.
    const sectionIdx = document.sections.findIndex(
      (sectionInDocument) => sectionInDocument.id == section.id
    );
    document.sections.splice(sectionIdx, 1);

    // Update document to re-render.
    setDocument({ ...document });
  }

  // --------------------------------------------------

  return (
    <Card className="SectionCard text-center">
      <CardHeader className="text-end">
        {errorMessages.map((msg) => (
          <Alert key={msg} color="danger">
            {msg}
          </Alert>
        ))}
        <img src={trashIcon} alt="trash icon" onClick={deleteSection} />
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
