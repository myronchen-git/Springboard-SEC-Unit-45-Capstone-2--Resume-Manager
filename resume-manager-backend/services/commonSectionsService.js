'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');
const { camelCase, sentenceCase } = require('change-case-all');

const Document = require('../models/document');
const {
  validateOwnership,
  getLastPosition,
} = require('../util/serviceHelpers');

const { BadRequestError, ForbiddenError } = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

/**
 * Creates a section item and document-(section item) relationship entry in the
 * database.  The new section item will be positioned after the last, or highest
 * value position, section item in the document.
 *
 * Note that, currently, section items can only be added to the master resume.
 * This can be changed in the future.
 *
 * Document ownership is first verified.
 *
 * @param {String} username - Name of user that wants to add a section item
 *  (education, experience, etc.) to the document.
 * @param {Number} documentId - ID of the document that is being attached with
 *  the section item.
 * @param {Object} props - Properties of the section item to add.
 * @returns {Promise<{
 *    sectionTypeNameInCamelCase: SectionTypeClass,
 *    document_x_sectionType: DocumentXSectionTypeClass
 *  }>}
 *  An Object containing a specific section type instance that contains the
 *  saved data and a document and specific section type relationship instance
 *  that contains the document-(section item) relationship data.
 * @throws {ForbiddenError} If the document is not the master resume.
 */
async function createSectionItem(
  classRef,
  documentXClassRef,
  username,
  documentId,
  props
) {
  const logPrefix =
    `${fileName}.createSectionItem(` +
    `classRef = ${classRef.name}, ` +
    `documentXClassRef = ${documentXClassRef.name}, ` +
    `username = "${username}", ` +
    `documentId = ${documentId}, ` +
    `props = ${JSON.stringify(props)})`;
  logger.verbose(logPrefix);

  const className = classRef.name;
  const classNameCamelCase = className[0].toLowerCase() + className.slice(1);

  // Verify document ownership and if document is master.
  const document = await validateOwnership(
    Document,
    username,
    { id: documentId },
    logPrefix
  );

  if (!document.isMaster) {
    logger.error(
      `${logPrefix}: User attempted to add a/an ${classNameCamelCase} ` +
        'not to the master resume.'
    );
    throw new ForbiddenError(
      `${className}s can only be added to the primary resume template.`
    );
  }

  // Create specific section item.
  const sectionItem = await classRef.add({ ...props, owner: username });

  // Find next position.
  const documentXSectionTypeRelationships = await documentXClassRef.getAll(
    documentId
  );
  const nextPosition = getLastPosition(documentXSectionTypeRelationships) + 1;

  // Create document-(section item) relationship.
  const documentXSectionTypeRelationship = await documentXClassRef.add({
    documentId,
    [classNameCamelCase + 'Id']: sectionItem.id,
    position: nextPosition,
  });

  return {
    [classNameCamelCase]: sectionItem,
    ['document_x_' + classNameCamelCase]: documentXSectionTypeRelationship,
  };
}

/**
 * Creates a document-(section item) relationship entry in the database. Section
 * item and document ownership are verified, then the next position is found by
 * getting all document-(section item) relationship records.
 *
 * @param {String} username - Name of user that wants to interact with the
 *  document.  This should be the owner.
 * @param {Number} documentId - ID of the document that is having a section item
 *  attach to it.
 * @param {Number} sectionItemId - ID of the section item to attach to the
 *  document.
 * @returns {Promise<DocumentXSectionTypeClass>} A document and specific section
 *  type relationship instance that contains the relationship data.
 * @throws {BadRequestError} If relationship already exists.
 */
async function createDocumentXSectionTypeRelationship(
  classRef,
  documentXClassRef,
  username,
  documentId,
  sectionItemId
) {
  const logPrefix =
    `${fileName}.createDocumentXSectionTypeRelationship(` +
    `classRef = ${classRef.name}, ` +
    `documentXClassRef = ${documentXClassRef.name}, ` +
    `username = "${username}", ` +
    `documentId = ${documentId}, ` +
    `sectionItemId = ${sectionItemId})`;
  logger.verbose(logPrefix);

  const className = classRef.name;
  const classNameLowerCaseSpaced = sentenceCase(className).toLowerCase();
  const classNameCamelCase = camelCase(className);

  // Verify ownership.
  await validateOwnership(classRef, username, { id: sectionItemId }, logPrefix);
  await validateOwnership(Document, username, { id: documentId }, logPrefix);

  // Find next proper position to place section item in.
  const documentXSectionTypeRelationships = await documentXClassRef.getAll(
    documentId
  );
  const nextPosition = getLastPosition(documentXSectionTypeRelationships) + 1;

  // Add relationship.
  try {
    return await documentXClassRef.add({
      documentId,
      [classNameCamelCase + 'Id']: sectionItemId,
      position: nextPosition,
    });
  } catch (err) {
    // PostgreSQL error code 23505 is for unique constraint violation.
    if (err.code === '23505') {
      logger.error(`${logPrefix}: Relationship already exists.`);
      throw new BadRequestError(
        `Can not add ${classNameLowerCaseSpaced} to document, ` +
          'as it already exists.'
      );
    } else {
      throw err;
    }
  }
}

/**
 * Changes the order of items in a section in a document.
 *
 * @param {String} username - Name of user that wants to interact with the
 *  document.  This should be the owner.
 * @param {Number} documentId - ID of the document that is having its section
 *  items reordered.
 * @param {Number[]} sectionItemIds - List of section item IDs with the desired
 *  ordering.
 * @returns {Promise<SectionTypeClass[]>} A list of section item instances, in
 *  order of position.
 * @throws {BadRequestError} If given section item IDs do not exactly match all
 *  section items of a section in a document.
 */
async function updateDocumentXSectionTypePositions(
  classRef,
  documentXClassRef,
  username,
  documentId,
  sectionItemIds
) {
  const logPrefix =
    `${fileName}.updateDocumentXSectionTypePositions(` +
    `classRef = ${classRef.name}, ` +
    `documentXClassRef = ${documentXClassRef.name}, ` +
    `username = "${username}", ` +
    `documentId = ${documentId}, ` +
    `sectionItemIds = ${JSON.stringify(sectionItemIds)})`;
  logger.verbose(logPrefix);

  const className = classRef.name;
  const classNameLowerCaseSpaced = sentenceCase(className).toLowerCase();
  const classNameCamelCase = camelCase(className);

  await validateOwnership(Document, username, { id: documentId }, logPrefix);

  // Verify that sectionItemIds contains all of the section items in the
  // document.
  const documentXSectionTypeRelationships = await documentXClassRef.getAll(
    documentId
  );

  if (
    documentXSectionTypeRelationships.length !== sectionItemIds.length ||
    !documentXSectionTypeRelationships.every((relationship) =>
      sectionItemIds.includes(relationship[classNameCamelCase + 'Id'])
    )
  ) {
    logger.error(
      `${logPrefix}: Provided ${classNameLowerCaseSpaced} IDs ` +
        'do not exactly match those in document.'
    );
    throw new BadRequestError(
      `Exactly all ${classNameLowerCaseSpaced}s need to be included ` +
        'when updating their positions in a document.'
    );
  }

  await documentXClassRef.updateAllPositions(documentId, sectionItemIds);

  return await classRef.getAllInDocument(documentId);
}

// ==================================================

module.exports = {
  createSectionItem,
  createDocumentXSectionTypeRelationship,
  updateDocumentXSectionTypePositions,
};
