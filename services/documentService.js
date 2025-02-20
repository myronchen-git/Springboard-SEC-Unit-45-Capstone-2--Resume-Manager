'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');

const Document = require('../models/document');

const { ArgumentError } = require('../errors/modelErrors');
const { ForbiddenError, NotFoundError } = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

/**
 * Updates a document by first verifying that it belongs to the specified user.
 * If document is the master resume, then only the document name is allowed to
 * be changed.
 *
 * @param {String} username - Name of user that wants to update the document.
 * @param {Number} documentId - ID of the document to be updated.
 * @param {Object} props - Properties of the document to be updated.  See route
 *  for full list.
 * @returns {Document} An Document instance containing the updated info.
 * @throws {ForbiddenError} If the document does not belong to the specified
 *  user.
 * @throws {ArgumentError} If the document is a master resume and document name
 *  is not being updated.
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

  if (document.isMaster) {
    const logMessage =
      `${logPrefix}: User "${username}" attempted to update master resume ` +
      `with ID ${documentId} with properties other than documentName.`;

    if (props.documentName) {
      if (props.length > 1) logger.warn(logMessage);
      return await document.update({ documentName: props.documentName });
    } else {
      logger.error(logMessage);
      throw new ArgumentError(
        'Only document name can be updated for master resumes.'
      );
    }
  } else {
    return await document.update(props);
  }
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
