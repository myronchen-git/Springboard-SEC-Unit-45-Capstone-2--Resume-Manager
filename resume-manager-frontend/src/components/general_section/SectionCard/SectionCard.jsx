import { Draggable } from '@hello-pangea/dnd';
import { useContext } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap';

import ResumeManagerApi from '../../../api.js';
import { AppContext, DocumentContext } from '../../../contexts.jsx';
import SectionItemsList from '../SectionItemsList/SectionItemsList.jsx';

import dotsIcon from '../../../assets/grip-horizontal.svg';
import TrashIcon from '../../TrashIcon/TrashIcon.jsx';

import './SectionCard.css';

// ==================================================

/**
 * Renders a card that contains the section name and its contents.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.section - Contains generic section info.
 * @param {Number} props.section.id - ID number of section.
 * @param {String} props.section.sectionName - Name of the section for
 *  displaying on document.
 * @param {Number} props.idx - Index of section in the list of sections.  This
 *  is used for @hello-pangea/dnd.
 */
function SectionCard({ section, idx }) {
  const { addAlert } = useContext(AppContext);
  const [document, setDocument] = useContext(DocumentContext);

  // --------------------------------------------------

  /**
   * Removes a section from a document.  In other words, this deletes a
   * document-section relationship.
   */
  async function deleteSection() {
    try {
      await ResumeManagerApi.deleteSection(document.id, section.id);
    } catch (err) {
      return err.forEach((message) => addAlert(message, 'danger'));
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
    <Draggable draggableId={'section-' + section.id} index={idx}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card className="SectionCard text-center" tag="article">
            <CardHeader tag="header">
              <span></span>
              <span>
                <img
                  src={dotsIcon}
                  alt="reposition icon"
                  viewBox="0 0 50 100"
                  preserveAspectRatio="none"
                  {...provided.dragHandleProps}
                />
              </span>
              <span>
                <TrashIcon clickFunc={deleteSection} />
              </span>
            </CardHeader>
            <CardBody tag="section">
              <CardTitle tag="h4">{section.sectionName}</CardTitle>
              <SectionItemsList sectionId={section.id} />
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

// ==================================================

export default SectionCard;
