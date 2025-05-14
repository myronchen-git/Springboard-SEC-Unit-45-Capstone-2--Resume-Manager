import { Droppable } from '@hello-pangea/dnd';
import { useContext } from 'react';

import { DocumentContext } from '../../../contexts.jsx';
import AddEducationCard from '../../education/AddEducationCard/AddEducationCard.jsx';
import AttachEducationCard from '../../education/AttachEducationCard/AttachEducationCard.jsx';
import EducationCard from '../../education/EducationCard/EducationCard.jsx';
import AddExperienceCard from '../../experience/AddExperienceCard/AddExperienceCard.jsx';
import AttachExperienceCard from '../../experience/AttachExperienceCard/AttachExperienceCard.jsx';
import ExperienceCard from '../../experience/ExperienceCard/ExperienceCard.jsx';

import { SECTION_ID_TO_DATABASE_NAME } from '../../../commonData.js';

import './SectionItemsList.css';

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
  const addSectionComponents = [null, AddEducationCard, AddExperienceCard];
  const attachSectionComponents = [
    null,
    AttachEducationCard,
    AttachExperienceCard,
  ];

  // Code for creating components stored here.
  // Note that sectionId must be an integer > 0.
  const SectionComponent = sectionComponents[sectionId];
  const renderedItems =
    SectionComponent == undefined
      ? null
      : items.map((item, idx) => (
          <SectionComponent key={item.id} item={item} idx={idx} />
        ));

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
      <Droppable droppableId={databaseName + '-list'} type={databaseName}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {renderedItems}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {document.isMaster
        ? renderAddItemForm(sectionId)
        : renderAttachItemForm(sectionId)}
    </div>
  );
}

// ==================================================

export default SectionItemsList;
