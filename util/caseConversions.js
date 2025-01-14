'use strict';

// ==================================================

/**
 * Converts a String from camel to snake case.
 * https://stackoverflow.com/a/54246501
 *
 * @param {String} str - Camel case String to convert from.
 * @returns {String} String in snake case.
 */
function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// ==================================================

module.exports = { camelToSnakeCase };
