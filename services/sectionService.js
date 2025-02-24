'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');

const Section = require('../models/section');
const Document_X_Section = require('../models/document_x_section');
const { validateDocumentOwner } = require('../util/serviceHelpers');

const logger = require('../util/logger');

// ==================================================

/**
 * Creates a document_x_section record (document-section relationship) in the
 * database.  The document owner is first verified, then the next position is
 * found by getting all document_x_section records.
 *
 * @param {String} username - Name of user that wants to interact with the
 *  document.  This should be the owner.
 * @param {Number} documentId - ID of the document that is having a section
 *  attach to it.
 * @param {Number} sectionId - ID of the section to attach to the document.
 * @returns {Document_X_Section} A Document_X_Section instance that contains the
 *  document-section relationship data.
 */
async function createDocument_x_section(username, documentId, sectionId) {
  const logPrefix =
    `${fileName}.createDocument_x_section(` +
    `username = "${username}", ` +
    `docId = ${documentId}, ` +
    `sectionId = ${sectionId})`;
  logger.verbose(logPrefix);

  await validateDocumentOwner(username, documentId, logPrefix);

  // Find Document_X_Section records for document and set position to be after
  // last / highest.
  const documents_x_sections = await Document_X_Section.getAll(documentId);
  const nextPosition = (documents_x_sections.at(-1)?.position ?? -1) + 1;

  return await Document_X_Section.add({
    documentId,
    sectionId,
    position: nextPosition,
  });
}

/**
 * Gets all sections belonging to a document.  Document ownership is first
 * verified.
 *
 * @param {String} username - Name of user that wants to interact with the
 *  document.  This should be the owner.
 * @param {Number} documentId - ID of the document to get sections from.
 * @returns {Section[]} A list of Section instances, which also include the
 *  position.
 */
async function getSections(username, documentId) {
  const logPrefix =
    `${fileName}.getSections(` +
    `username = "${username}", ` +
    `documentId = ${documentId})`;
  logger.verbose(logPrefix);

  await validateDocumentOwner(username, documentId, logPrefix);

  return await Section.getAllInDocument(documentId);
}

// ==================================================

module.exports = { createDocument_x_section, getSections };
