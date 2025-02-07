'use strict';

const express = require('express');
const jsonschema = require('jsonschema');

const userRegisterSchema = require('../schemas/userRegister.json');

const User = require('../models/user');
const { createJWT } = require('../util/tokens');

const { BadRequestError } = require('../errors/appErrors');
const logger = require('../util/logger');

// ==================================================

const router = new express.Router();

// --------------------------------------------------

/**
 * POST /auth/register
 * { username, password } => { authToken }
 *
 * Authorization required: none
 *
 * @param {String} username - Username for the new user.
 * @param {String} password - Password for the new user.
 * @returns {String} authToken - A JWT that can be used to authenticate further
 *  requests.
 */
router.post('/register', async (req, res, next) => {
  const logPrefix = `POST /auth/register (request body: ${JSON.stringify({
    ...req.body,
    password: '(password)',
  })})`;
  logger.verbose(logPrefix + ': BEGIN');

  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      logger.error(
        `${logPrefix}: JSON schema validation failed.  ${errs.join(', ')}`
      );
      throw new BadRequestError(errs);
    }

    const newUser = await User.register(req.body);
    const authToken = createJWT(newUser);

    return res.status(201).json({ authToken });
  } catch (err) {
    // These reassigned error messages are specific to the JSON schema.  Ensure
    // that these are up-to-date.
    if (err.message.includes('instance.username')) {
      err.message = 'Username must be 3-30 characters long.';
    } else if (err.message.includes('password does not match pattern')) {
      err.message =
        'Password must be 6-20 characters long and contain a ' +
        'number, uppercase letter, lowercase letter, and symbol.';
    }

    return next(err);
  }
});

// ==================================================

module.exports = router;
