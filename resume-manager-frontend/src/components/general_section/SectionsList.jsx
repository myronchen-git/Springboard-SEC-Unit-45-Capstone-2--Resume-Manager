import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import AddSectionCard from './AddSectionCard.jsx';
import SectionCard from './SectionCard.jsx';

import { SECTION_ID_TO_DATABASE_NAME } from '../../commonData.js';

// ==================================================

/**
 * Renders a list of sections for a resume.
 */
function SectionsList() {
  const [document, setDocument] = useContext(DocumentContext);

  const [availableSections, setAvailableSections] = useState([]);
  // Holds the timeout IDs of [sections, educations, experiences].
  const repositionTimeoutIdsRef = useRef(new Array(3).fill(null));
  // Holds old lists of [sections, educations, experiences].
  const oldListsRef = useRef(new Array(3).fill(null));

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
   * @param {Number} sectionId - ID of the section to add.
   */
  async function addSection(sectionId) {
    await ResumeManagerApi.addSection(document.id, sectionId);

    // Clone document so that React sees the document state has been modified.
    const documentClone = structuredClone(document);

    // Create an Object for the new section, so that it can be inserted into the
    // document Object/state.
    const sectionName = availableSections.find(
      (section) => section.id === sectionId
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
   * Repositions sections, educations, experiences, etc. visually and sends an
   * API request to the back-end to save the new positions.  The API request is
   * delayed to reduce unnecessary network calls.
   *
   * Note that the old lists and related timeout IDs are separated between
   * sections, educations, experiences, etc. to allow repositioning and
   * restoring to be independent between sections, etc..
   *
   * @param {Number} sourceIndex - Original index of section, etc..
   * @param {Number} destinationIndex - Desired index of section, etc..
   * @param {Number} idIdx - Index corresponding to section type, represented in
   *  this array: [sections, educations, experiences].
   * @param {Function} repositionFunc - The function in ResumeManagerApi that
   *  will send the API request to the back-end.
   */
  const repositionHelper = useCallback(
    async (sourceIndex, destinationIndex, idIdx, repositionFunc) => {
      const timeDelay = 3000;
      // Patch to get "sections" name.
      const sectionName =
        idIdx === 0 ? 'sections' : SECTION_ID_TO_DATABASE_NAME[idIdx];
      const timeoutIds = repositionTimeoutIdsRef.current;
      const oldLists = oldListsRef.current;

      // Save old ordering to use if API request fails, with disregard to how
      // many repositions have been performed.
      oldLists[idIdx] ||= [...document[sectionName]];

      // Get a new list Array with each item in their new positions.
      const newList = [...document[sectionName]];
      const [removed] = newList.splice(sourceIndex, 1);
      newList.splice(destinationIndex, 0, removed);

      // Update document state to show reordered list.
      setDocument({ ...document, [sectionName]: newList });

      const newListIds = newList.map((item) => item.id);

      // Reset timeout if there already is one.  Set timeout to make a delayed
      // API request.
      clearTimeout(timeoutIds[idIdx]);
      timeoutIds[idIdx] = setTimeout(async () => {
        try {
          await repositionFunc(document.id, newListIds);
        } catch (err) {
          // TODO: display error message
          console.error(err);

          // Put list back to its original order.
          setDocument({ ...document, [sectionName]: oldLists[idIdx] });
        } finally {
          timeoutIds[idIdx] = null;
          oldLists[idIdx] = null;
        }
      }, timeDelay);
    },
    [document, setDocument]
  );

  async function onDragEnd(result) {
    const { destination, source, type } = result;

    if (destination && destination.index !== source.index) {
      if (type === 'sections')
        return await repositionHelper(
          source.index,
          destination.index,
          0,
          ResumeManagerApi.repositionSections.bind(ResumeManagerApi)
        );
      if (type === 'educations')
        return await repositionHelper(
          source.index,
          destination.index,
          1,
          ResumeManagerApi.repositionEducations.bind(ResumeManagerApi)
        );
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
