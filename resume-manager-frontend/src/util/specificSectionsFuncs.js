import ResumeManagerApi from '../api.js';

import { SECTION_ID_TO_DATABASE_NAME } from '../commonData.js';

// ==================================================

/**
 * Sends a request to the back-end to create a new section item (education,
 * experience, etc.) and creates a document clone with the new item.  The
 * returned document clone can then be used to update the document state.
 *
 * @param {Object} document - The same document that is the app state, which
 *  contains document properties and section contents.
 * @param {Number} sectionId - The ID of the section to add a new education,
 *  experience, etc. to.
 * @param {Object} formData - The data required for creating a new education,
 *  experience, etc..
 * @see ResumeManagerApi for formData properties.
 * @returns {Object} A clone of the document Object, but with the new section
 *  item added to it.
 */
async function addNewSectionItem(document, sectionId, formData) {
  let sectionItemObject;
  switch (sectionId) {
    case 1:
      ({ education: sectionItemObject } = await ResumeManagerApi.addEducation(
        document.id,
        formData
      ));
      break;
    case 2:
      ({ experience: sectionItemObject } = await ResumeManagerApi.addExperience(
        document.id,
        formData
      ));
      break;
    default:
      throw new TypeError('Developer Error: unrecognized section type.');
  }

  // Clone document so that React sees the document state has been modified.
  const documentClone = structuredClone(document);

  const sectionDatabaseName = SECTION_ID_TO_DATABASE_NAME[sectionId];

  // Add the section item Object (education, experience, etc.) to related
  // section property in document if it exists, otherwise create a new
  // property.
  if (documentClone[sectionDatabaseName]) {
    documentClone[sectionDatabaseName].push(sectionItemObject);
  } else {
    documentClone[sectionDatabaseName] = [sectionItemObject];
  }

  return documentClone;
}

/**
 * Sends a request to the back-end to attach a section item (education,
 * experience, etc.) to a document and creates a document clone with the item in
 * it.  In other words, sends a request to create a document-... relationship.
 * The returned document clone can then be used to update the document state.
 *
 * @param {Object} document - The same document that is the app state, which
 *  contains document properties and section contents.
 * @param {Number} sectionId - The ID of the section to add a new education,
 *  experience, etc. to.
 * @param {String | Number} sectionItemId - The ID of the education, experience,
 *  etc. to attach to the document.
 * @param {Object} sectionItemObject - Object containing the data that will be
 *  displayed in the document.
 * @returns {Object} A clone of the document Object, but with the section item
 *  added to it.
 */
async function attachSectionItem(
  document,
  sectionId,
  sectionItemId,
  sectionItemObject
) {
  switch (sectionId) {
    case 1:
      await ResumeManagerApi.attachEducationToDocument(
        document.id,
        sectionItemId
      );
      break;
    default:
      throw new TypeError('Developer Error: unrecognized section type.');
  }

  // Clone document so that React sees the document state has been modified.
  const documentClone = structuredClone(document);

  const sectionDatabaseName = SECTION_ID_TO_DATABASE_NAME[sectionId];

  // Add the section item Object (education, experience, etc.) to related
  // section property in document if it exists, otherwise create a new
  // property.
  if (documentClone[sectionDatabaseName]) {
    documentClone[sectionDatabaseName].push(sectionItemObject);
  } else {
    documentClone[sectionDatabaseName] = [sectionItemObject];
  }

  return documentClone;
}

// ==================================================

export { addNewSectionItem, attachSectionItem };
