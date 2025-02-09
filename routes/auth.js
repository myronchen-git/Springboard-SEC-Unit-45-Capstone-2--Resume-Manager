'use strict';

const express = require('express');
const jsonschema = require('jsonschema');

const userRegisterSchema = require('../schemas/userRegister.json');
const userSigninSchema = require('../schemas/userSignin.json');

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
      err.message = User.usernameRequirementsMessage;
    } else if (err.message.includes('password does not match pattern')) {
      err.message = User.passwordRequirementsMessage;
    }

    return next(err);
  }
});

/**
 * POST /auth/signin
 * { username, password } => { authToken }
 *
 * Authorization required: none
 *
 * @param {String} username - Username of the existing user.
 * @param {String} password - Password of the existing user.
 * @returns {String} authToken - A JWT that can be used to authenticate further
 *  requests.
 */
router.post('/signin', async (req, res, next) => {
  const logPrefix = `POST /auth/signin (request body: ${JSON.stringify({
    ...req.body,
    password: '(password)',
  })})`;
  logger.verbose(logPrefix + ': BEGIN');

  try {
    const validator = jsonschema.validate(req.body, userSigninSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      logger.error(
        `${logPrefix}: JSON schema validation failed.  ${errs.join(', ')}`
      );
      throw new BadRequestError(errs);
    }

    const user = await User.signin(req.body);
    const authToken = createJWT(user);

    return res.json({ authToken });
  } catch (err) {
    return next(err);
  }
});

// ==================================================

module.exports = router;
