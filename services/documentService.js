'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');

const Document = require('../models/document');

const { ForbiddenError, NotFoundError } = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

/**
 * Updates a document by first verifying that it belongs to the specified user.
 *
 * @param {String} username - Name of user that wants to update the document.
 * @param {Number} documentId - ID of the document to be updated.
 * @param {Object} props - Properties of the document to be updated.
 * @returns {Document} An Document instance containing the updated info.
 * @throws {ForbiddenError} If the document does not belong to the specified
 *  user.
 */
async function updateDocument(username, documentId, props) {
  const logPrefix =
    `${fileName}.updateDocument(` +
    `username = "${username}", ` +
    `documentId = ${documentId}, ` +
    `props = ${JSON.stringify(props)})`;
  logger.verbose(logPrefix);

  const document = await Document.get({ id: documentId });

  if (document.owner !== username) {
    logger.error(
      `${logPrefix}: User "${username}" attempted to update document ` +
        `with ID ${documentId}, which belongs to "${document.owner}".`
    );
    throw new ForbiddenError(
      `Can not update document with ID ${documentId}, ` +
        'as it belongs to another user.'
    );
  }

  return await document.update(props);
}

/**
 * Deletes a document by first verifying that it belongs to the specified user.
 *
 * @param {String} username - Name of user that wants to delete the document.
 * @param {Number} documentId - ID of the document to be deleted.
 * @throws {ForbiddenError} If the document does not belong to the specified
 *  user.
 */
async function deleteDocument(username, documentId) {
  const logPrefix =
    `${fileName}.deleteDocument(` +
    `username = "${username}", ` +
    `documentId = ${documentId})`;
  logger.verbose(logPrefix);

  let document;
  try {
    document = await Document.get({ id: documentId });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return;
    } else {
      throw err;
    }
  }

  if (document.owner !== username) {
    logger.error(
      `${logPrefix}: User "${username}" attempted to delete document ` +
        `with ID ${documentId}, which belongs to "${document.owner}".`
    );
    throw new ForbiddenError(
      `Can not delete document with ID ${documentId}, ` +
        'as it belongs to another user.'
    );
  }

  await document.delete();
}

// ==================================================

module.exports = { updateDocument, deleteDocument };
