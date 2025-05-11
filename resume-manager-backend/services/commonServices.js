'use strict';

const path = require('path');
const fileName = path.basename(__filename, '.js');

const { NotFoundError } = require('../errors/appErrors');

const { validateOwnership } = require('../util/serviceHelpers');

const logger = require('../util/logger');

// ==================================================

/**
 * Performs validations and processing before deleting an item (document,
 * education, experience, text snippet, etc.).
 *
 * @param {String} username - Name of user that wants to delete the item. This
 *  should be the owner.
 * @param {Object} id - Contains the ID(s) of the items to delete.
 * @param {extraFunction} runExtraFunction - Runs additional processing.
 */
async function deleteItem(classRef, username, id, runExtraFunction = null) {
  const logPrefix =
    `${fileName}.deleteItem(` +
    `classRef = ${classRef.name}, ` +
    `username = "${username}", ` +
    `id = ${JSON.stringify(id)}, ` +
    `runExtraFunction is ${runExtraFunction ? '' : 'not '}given)`;
  logger.verbose(logPrefix);

  let item;
  try {
    item = await validateOwnership(classRef, username, id, logPrefix);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return;
    } else {
      throw err;
    }
  }

  runExtraFunction && (await runExtraFunction(item));

  await item.delete();
}

// --------------------------------------------------

/**
 * An extra function to run before completing a function.
 *
 * @callback extraFunction
 * @param {Object} item - The document, education, experience, text snippet, or
 * etc. retrieved when validating ownership.
 */

// ==================================================

module.exports = {
  deleteItem,
};
