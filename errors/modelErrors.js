/** Errors related to all models. */

'use strict';

const { BadRequestError } = require('./appErrors');

// ==================================================

/**
 * Represents any issue with the arguments of a function.
 */
class ArgumentError extends BadRequestError {
  constructor(message) {
    super(message);
    this.name = 'ArgumentError';
  }
}

// ==================================================

module.exports = { ArgumentError };
