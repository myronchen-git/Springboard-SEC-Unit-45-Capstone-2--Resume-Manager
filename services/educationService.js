'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');

const Education = require('../models/education');
const Document_X_Education = require('../models/document_x_education');
const {
  validateDocumentOwner,
  getLastPosition,
} = require('../util/serviceHelpers');

const { ForbiddenError } = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

/**
 * Creates an education and document-education relationship entry in the
 * database.  The new education will be positioned after the last, or highest
 * value position, education in the document.
 *
 * Note that, currently, educations can only be added to the master resume. This
 * can be changed in the future.
 *
 * Document ownership is first verified.
 *
 * @param {String} username - Name of user that wants to add an education to the
 *  document.
 * @param {Number} documentId - ID of the document that is being attached with
 *  an education.
 * @param {Object} props - Properties of the education to add.
 * @returns {{
 *    education: Education,
 *    document_x_education: Document_X_Education
 *  }}
 *  An Object containing an Education instance that contains the saved data
 *  and a Document_X_Education instance that contains the document-education
 *  relationship data.
 */
async function createEducation(username, documentId, props) {
  const logPrefix =
    `${fileName}.createEducation(` +
    `username = "${username}", ` +
    `documentId = ${documentId}, ` +
    `props = ${JSON.stringify(props)})`;
  logger.verbose(logPrefix);

  const document = await validateDocumentOwner(username, documentId, logPrefix);

  if (!document.isMaster) {
    logger.error(
      'User attempted to add an education not to the master resume.'
    );
    throw new ForbiddenError(
      'Educations can only be added to the master resume.'
    );
  }

  const education = await Education.add({ ...props, owner: username });

  const documents_x_educations = await Document_X_Education.getAll(documentId);
  const nextPosition = getLastPosition(documents_x_educations) + 1;

  const document_x_education = await Document_X_Education.add({
    documentId,
    educationId: education.id,
    position: nextPosition,
  });

  return { education, document_x_education };
}

// ==================================================

module.exports = { createEducation };
