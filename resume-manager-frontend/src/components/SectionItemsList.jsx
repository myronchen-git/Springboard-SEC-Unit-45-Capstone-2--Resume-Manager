import { useContext } from 'react';

import { DocumentContext } from '../contexts.jsx';
import AddEducationCard from './AddEducationCard.jsx';
import AttachEducationCard from './AttachEducationCard.jsx';
import EducationCard from './EducationCard.jsx';
import ExperienceCard from './ExperienceCard.jsx';

import { SECTION_ID_TO_DATABASE_NAME } from '../commonData.js';

// ==================================================

function SectionItemsList({ sectionId }) {
  const [document] = useContext(DocumentContext);

  // Note that section.id must be an integer > 0.
  const databaseName = SECTION_ID_TO_DATABASE_NAME[sectionId];

  const items = document[databaseName] || [];

  // --------------------------------------------------

  // Holds the components that can be used to display a section item.
  // Section IDs are the index positions.
  const sectionComponents = [null, EducationCard, ExperienceCard];
  const addSectionComponents = [null, AddEducationCard];
  const attachSectionComponents = [null, AttachEducationCard];

  // Code for creating components stored here.
  // Note that sectionId must be an integer > 0.
  const SectionComponent = sectionComponents[sectionId];
  const renderedItems =
    SectionComponent == undefined
      ? null
      : items.map((item) => <SectionComponent key={item.id} item={item} />);

  function renderAddItemForm(sectId) {
    // Note that sectionId must be an integer > 0.
    const AddSectionComponent = addSectionComponents[sectId];
    return AddSectionComponent == undefined ? null : <AddSectionComponent />;
  }

  function renderAttachItemForm(sectId) {
    // Note that sectionId must be an integer > 0.
    const AttachSectionComponent = attachSectionComponents[sectId];
    return AttachSectionComponent == undefined ? null : (
      <AttachSectionComponent />
    );
  }

  // --------------------------------------------------

  return (
    <div className="SectionItemsList">
      {renderedItems}
      {document.isMaster
        ? renderAddItemForm(sectionId)
        : renderAttachItemForm(sectionId)}
    </div>
  );
}

// ==================================================

export default SectionItemsList;
