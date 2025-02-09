'use strict';

const express = require('express');
const jsonschema = require('jsonschema');

const userUpdateSchema = require('../schemas/userUpdate.json');

const User = require('../models/user');
const { ensureLoggedIn } = require('../middleware/auth');

const { BadRequestError } = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

const router = new express.Router();

// --------------------------------------------------

/**
 * PATCH /users/:username
 * { oldPassword, newPassword } => { user }
 *
 * Authorization required: login
 *
 * @param {String} [oldPassword] - User's old password.
 * @param {String} [newPassword] - User's new password.
 * @returns {Object} user - Contains all user account info, except password.
 **/
router.patch('/:username', ensureLoggedIn, async (req, res, next) => {
  const userPayload = res.locals.user;

  const requestBodyForLog = { ...req.body };
  requestBodyForLog.oldPassword &&= '(password)';
  requestBodyForLog.newPassword &&= '(password)';

  const logPrefix =
    'PATCH /users/:username (' +
    `user: ${JSON.stringify(userPayload)}, ` +
    `request body: ${JSON.stringify(requestBodyForLog)})`;
  logger.verbose(logPrefix + ': BEGIN');

  try {
    // Check that old password is supplied if setting new password.
    if (req.body.newPassword && !req.body.oldPassword) {
      const message = 'Old password is required if setting new password.';
      logger.error(`${logPrefix}: ${message}`);
      throw new BadRequestError(message);
    }

    // Using JSON schema validator.
    const validator = jsonschema.validate(req.body, userUpdateSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);

      logger.error(
        `${logPrefix}: JSON schema validation failed.  ${errs.join(', ')}`
      );

      const rewordedErrs = errs.map((err) => {
        return err.toLowerCase().includes('password does not match pattern')
          ? 'Password must be 6-20 characters long and contain a ' +
              'number, uppercase letter, lowercase letter, and symbol.'
          : err;
      });

      throw new BadRequestError(rewordedErrs);
    }

    // Setting up data for updating.
    const dataToUpdate = { ...req.body };
    delete dataToUpdate.oldPassword;

    if (req.body.newPassword) {
      // Verify old password.
      await User.signin({
        username: userPayload.username,
        password: req.body.oldPassword,
      });

      // Setting up data for updating password.
      delete dataToUpdate.newPassword;
      dataToUpdate.password = req.body.newPassword;
    }

    // Updating user data.
    const user = await User.update(userPayload.username, dataToUpdate);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

// ==================================================

module.exports = router;
