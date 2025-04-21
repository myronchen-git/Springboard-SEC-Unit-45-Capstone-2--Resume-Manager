import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import AddSectionCard from './AddSectionCard.jsx';
import SectionCard from './SectionCard.jsx';

// ==================================================

/**
 * Renders a list of sections for a resume.
 */
function SectionsList() {
  const [document, setDocument] = useContext(DocumentContext);

  const [availableSections, setAvailableSections] = useState([]);
  const repositionTimeoutIdRef = useRef(null);
  const oldSections = useRef(null);
  const oldEducations = useRef(null);

  // --------------------------------------------------

  useEffect(() => {
    async function runEffect() {
      setAvailableSections(await ResumeManagerApi.getSections());
    }

    runEffect();
  }, []);

  // --------------------------------------------------

  /**
   * Adds a new section to the document, both in the database and in the
   * front-end.  The section is created locally in the front-end to avoid making
   * a network call, though this could cause desync issues.
   *
   * @param {String} sectionId - ID of the section to add.
   */
  async function addSection(sectionId) {
    await ResumeManagerApi.addSection(document.id, sectionId);

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Create an Object for the new section, so that it can be inserted into the
    // document Object/state.
    const sectionName = availableSections.find(
      (section) => section.id == sectionId
    ).sectionName;
    const newSection = { id: sectionId, sectionName };

    // Add the new section Object to document.sections if it exists, otherwise
    // create a new sections property.
    if (documentClone.sections) {
      documentClone.sections.push(newSection);
    } else {
      documentClone.sections = [newSection];
    }

    setDocument(documentClone);
  }

  /**
   * Repositions sections visually and sends an API request to the back-end to
   * save the new positions.  The API request is delayed to reduce unnecessary
   * network calls.
   *
   * @param {Number} sourceIndex - Original index of section.
   * @param {Number} destinationIndex - Desired index of section.
   */
  const repositionSections = useCallback(
    async (sourceIndex, destinationIndex) => {
      const timeDelay = 3000;

      // Save old sections ordering to use if API request fails, with disregard
      // to how many repositions have been performed.
      oldSections.current ||= [...document.sections];

      // Get a new sections Array with each section in their new positions.
      const newSections = [...document.sections];
      const [removed] = newSections.splice(sourceIndex, 1);
      newSections.splice(destinationIndex, 0, removed);

      // Update document state to show reordered sections.
      setDocument({ ...document, sections: newSections });

      const newSectionIds = newSections.map((section) => section.id);

      // Reset timeout if there already is one.  Set timeout to make a delayed
      // API request.
      clearTimeout(repositionTimeoutIdRef.current);
      repositionTimeoutIdRef.current = setTimeout(async () => {
        try {
          await ResumeManagerApi.repositionSections(document.id, newSectionIds);
        } catch (err) {
          // TODO: display error message

          // Put sections back to their original order.
          setDocument({ ...document, sections: oldSections.current });
        } finally {
          repositionTimeoutIdRef.current = null;
          oldSections.current = null;
        }
      }, timeDelay);
    },
    [document, setDocument]
  );

  /**
   * Repositions educations visually and sends an API request to the back-end to
   * save the new positions.  The API request is delayed to reduce unnecessary
   * network calls.
   *
   * @param {Number} sourceIndex - Original index of education.
   * @param {Number} destinationIndex - Desired index of education.
   */
  const repositionEducations = useCallback(
    async (sourceIndex, destinationIndex) => {
      const timeDelay = 3000;

      oldEducations.current ||= [...document.educations];

      const newEducations = [...document.educations];
      const [removed] = newEducations.splice(sourceIndex, 1);
      newEducations.splice(destinationIndex, 0, removed);

      setDocument({ ...document, educations: newEducations });

      const newEducationIds = newEducations.map((education) => education.id);

      clearTimeout(repositionTimeoutIdRef.current);
      repositionTimeoutIdRef.current = setTimeout(async () => {
        try {
          await ResumeManagerApi.repositionEducations(
            document.id,
            newEducationIds
          );
        } catch (err) {
          // TODO: display error message

          // Put educations back to their original order.
          setDocument({ ...document, educations: oldEducations.current });
        } finally {
          repositionTimeoutIdRef.current = null;
          oldEducations.current = null;
        }
      }, timeDelay);
    },
    [document, setDocument]
  );

  async function onDragEnd(result) {
    const { destination, source, type } = result;

    if (destination && destination.index !== source.index) {
      if (type === 'sections')
        return await repositionSections(source.index, destination.index);
      if (type === 'educations')
        return await repositionEducations(source.index, destination.index);
    }
  }

  // --------------------------------------------------

  const existingSections = document?.sections
    ? document.sections.map((section, idx) => {
        return <SectionCard key={section.id} section={section} idx={idx} />;
      })
    : [];

  return (
    <article>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections-list" type="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {existingSections}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <AddSectionCard
        availableSections={availableSections}
        addSection={addSection}
      />
    </article>
  );
}

// ==================================================

export default SectionsList;
