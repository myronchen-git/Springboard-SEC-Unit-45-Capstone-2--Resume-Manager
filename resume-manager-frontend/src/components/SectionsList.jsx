import { useContext, useEffect, useState } from 'react';

import ResumeManagerApi from '../api.js';
import { DocumentContext } from '../contexts.jsx';
import AddSectionCard from './AddSectionCard.jsx';
import SectionCard from './SectionCard.jsx';

// ==================================================

// Section IDs are the index positions.
const sectionIdToDatabaseName = [
  null,
  'educations',
  'experiences',
  'skills',
  'certifications',
  'projects',
];

// --------------------------------------------------

/**
 * Renders a list of sections for a resume.
 */
function SectionsList() {
  const [availableSections, setAvailableSections] = useState([]);
  const [document, setDocument] = useContext(DocumentContext);

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

  // --------------------------------------------------

  const existingSections = document?.sections
    ? document.sections.map((section) => {
        // Note that section.id must be an integer > 0.
        const databaseName = sectionIdToDatabaseName[section.id];

        return (
          <SectionCard
            key={section.id}
            section={section}
            items={document[databaseName] || []}
          />
        );
      })
    : [];

  return (
    <article>
      {existingSections}
      <AddSectionCard
        availableSections={availableSections}
        addSection={addSection}
      />
    </article>
  );
}

// ==================================================

export default SectionsList;
