import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useCallback, useContext, useRef } from 'react';

import ResumeManagerApi from '../../api.js';
import { DocumentContext } from '../../contexts.jsx';
import AttachSectionCard from './AttachSectionCard.jsx';
import SectionCard from './SectionCard.jsx';

import { SECTION_ID_TO_DATABASE_NAME } from '../../commonData.js';

// ==================================================

/**
 * Renders a list of sections for a resume.
 */
function SectionsList() {
  const [document, setDocument] = useContext(DocumentContext);

  // Holds the timeout IDs of [sections, educations, experiences].
  const repositionTimeoutIdsRef = useRef(new Array(3).fill(null));
  // Holds old lists of [sections, educations, experiences].
  const oldListsRef = useRef(new Array(3).fill(null));
  const repositionExperienceTextSnippetsTimeoutIdsRef = useRef(new Map());
  const oldExperienceTextSnippetsRef = useRef(new Map());

  const repositionTimeDelay = 3000;

  // --------------------------------------------------

  /**
   * Attaches a new section to the document, both in the database and in the
   * front-end.
   *
   * @param {Number} sectionId - ID of the section to attach.
   * @param {Object} sectionToAttach - The section Object to attach to the
   *  document state.
   */
  async function attachSection(sectionId, sectionToAttach) {
    await ResumeManagerApi.attachSectionToDocument(document.id, sectionId);

    // Clone document so that React sees the document state has been modified.
    const documentClone = { ...document };

    // Add the new section Object to document.sections if it exists, otherwise
    // create a new sections property.
    if (documentClone.sections) {
      documentClone.sections = [...documentClone.sections, sectionToAttach];
    } else {
      documentClone.sections = [sectionToAttach];
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
      }, repositionTimeDelay);
    },
    [document, setDocument]
  );

  /**
   * Repositions text snippets within an experience visually and sends an API
   * request to the back-end to save the new positions.  The API request is
   * delayed to reduce unnecessary network calls.
   *
   * Note that the old lists and related timeout IDs are separated between text
   * snippet lists to allow repositioning and restoring to be independent
   * between them.
   *
   * @param {Number} sourceIndex - Original index of text snippet.
   * @param {Number} destinationIndex - Desired index of text snippet.
   * @param {Number} experienceId - ID of the experience that the text snippets
   *  belong to.
   */
  const repositionExperienceTextSnippet = useCallback(
    (sourceIndex, destinationIndex, experienceId) => {
      const timeoutIds = repositionExperienceTextSnippetsTimeoutIdsRef.current;
      const oldTextSnippetLists = oldExperienceTextSnippetsRef.current;

      // Find the index of the experience in the list of experiences, so that it
      // can be found again in the document state.
      const experienceIdx = document.experiences.findIndex(
        (experience) => experience.id === experienceId
      );

      // Save old ordering to use if API request fails, with disregard to how
      // many repositions have been performed.
      const oldBullets = [...document.experiences[experienceIdx].bullets];
      if (!oldTextSnippetLists.has(experienceId))
        oldTextSnippetLists.set(experienceId, oldBullets);

      // Get a new list Array with each item in their new positions.
      const newBullets = [...document.experiences[experienceIdx].bullets];
      const [removed] = newBullets.splice(sourceIndex, 1);
      newBullets.splice(destinationIndex, 0, removed);

      // Update document state to show reordered list.
      const updatedDocument = { ...document };
      updatedDocument.experiences[experienceIdx].bullets = newBullets;
      setDocument(updatedDocument);

      const newBulletsIds = newBullets.map((item) => item.id);

      // Reset timeout if there already is one.  Set timeout to make a delayed
      // API request.
      if (timeoutIds.has(experienceId))
        clearTimeout(timeoutIds.get(experienceId));
      const timeoutId = setTimeout(async () => {
        try {
          await ResumeManagerApi.repositionExperienceTextSnippets(
            document.id,
            experienceId,
            newBulletsIds
          );
        } catch (err) {
          // TODO: display error message
          console.error(err);

          // Put list back to its original order.
          const originalDocument = { ...document };
          originalDocument.experiences[experienceIdx].bullets =
            oldTextSnippetLists.get(experienceId);
          setDocument(originalDocument);
        } finally {
          timeoutIds.delete(experienceId);
          oldTextSnippetLists.delete(experienceId);
        }
      }, repositionTimeDelay);
      timeoutIds.set(experienceId, timeoutId);
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
      if (type === 'experiences') {
        return await repositionHelper(
          source.index,
          destination.index,
          2,
          ResumeManagerApi.repositionExperiences.bind(ResumeManagerApi)
        );
      }
      if (type.startsWith('experience') && type.endsWith('textSnippet')) {
        const experienceId = Number(type.split('-')[1]);
        return await repositionExperienceTextSnippet(
          source.index,
          destination.index,
          experienceId
        );
      }
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
      <AttachSectionCard attachSection={attachSection} />
    </article>
  );
}

// ==================================================

export default SectionsList;
