'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');

const Document = require('../models/document');
const { deleteItem } = require('./commonServices');
const { validateOwnership } = require('../util/serviceHelpers');

const { ForbiddenError, ArgumentError } = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

/**
 * Helps validate the owner of a document, then retrieves it.
 *
 * @param {String} username - Name of user that wants to get the document.
 * @param {Number} documentId - ID of the document to get.
 * @returns {Object} All needed data to display a resume or template.
 */
async function getDocument(username, documentId) {
  const logPrefix =
    `${fileName}.getDocument(` +
    `username = "${username}", ` +
    `documentId = ${documentId})`;
  logger.verbose(logPrefix);

  await validateOwnership(Document, username, { id: documentId }, logPrefix);

  return await Document.getDocumentAndSectionContent(documentId);
}

/**
 * Updates a document by first verifying that it belongs to the specified user.
 * If document is the master resume, then only the document name is allowed to
 * be changed.
 *
 * @param {String} username - Name of user that wants to update the document.
 * @param {Number} documentId - ID of the document to be updated.
 * @param {Object} props - Properties of the document to be updated.  See route
 *  for full list.
 * @returns {Document} A Document instance containing the updated info.
 * @throws {ArgumentError} If the document is a master resume and document name
 *  is not the only one being updated.
 */
async function updateDocument(username, documentId, props) {
  const logPrefix =
    `${fileName}.updateDocument(` +
    `username = "${username}", ` +
    `documentId = ${documentId}, ` +
    `props = ${JSON.stringify(props)})`;
  logger.verbose(logPrefix);

  const document = await validateOwnership(
    Document,
    username,
    { id: documentId },
    logPrefix
  );

  if (document.isMaster) {
    if (!props.documentName || Object.keys(props).length > 1) {
      logger.error(
        `${logPrefix}: User "${username}" attempted to update master resume ` +
          `with ID ${documentId} with properties other than documentName.`
      );
      throw new ArgumentError(
        'Only document name can be updated for primary resume templates.'
      );
    }
  }

  return await document.update(props);
}

/**
 * Deletes a document by first verifying that it belongs to the specified user.
 * Master resumes can not be deleted.
 *
 * @param {String} username - Name of user that wants to delete the document.
 * @param {Number} documentId - ID of the document to be deleted.
 * @throws {ForbiddenError} If the document is the master resume.
 * @throws {ForbiddenError} If the document does not belong to the specified
 *  user.
 */
async function deleteDocument(username, documentId) {
  const logPrefix =
    `${fileName}.deleteDocument(` +
    `username = "${username}", ` +
    `documentId = ${documentId})`;
  logger.verbose(logPrefix);

  await deleteItem(Document, username, { id: documentId }, (document) => {
    if (document.isMaster) {
      logger.error(`${logPrefix}: User attempted to delete the master resume.`);
      throw new ForbiddenError('Can not delete primary resume template.');
    }
  });
}

// ==================================================

module.exports = { getDocument, updateDocument, deleteDocument };
