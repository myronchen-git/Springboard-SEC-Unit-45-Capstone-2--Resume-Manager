'use strict';

const express = require('express');

const educationNewSchema = require('../schemas/educationNew.json');
const urlParamsSchema = require('../schemas/urlParams.json');

const { createEducation } = require('../services/educationService');
const { ensureLoggedIn } = require('../middleware/auth');
const { runJsonSchemaValidator } = require('../util/validators');

const logger = require('../util/logger');

// ==================================================

const router = new express.Router();

// --------------------------------------------------

/**
 * POST /users/:username/documents/:documentId/educations
 * {
 *  school,
 *  location,
 *  startDate,
 *  endDate,
 *  degree,
 *  gpa,
 *  awardsAndHonors,
 *  activities
 * } => { education, document_x_education }
 *
 * Authorization required: login
 *
 * Creates an education entry and a relationship between the entry and the
 * document.  The position of the new entry will be after the last position of
 * any existing educations.
 *
 * Note that, currently, educations can only be added to the master resume.
 * This can be changed in the future.
 *
 * @returns {{
 *    education: Education,
 *    document_x_education: Document_X_Education
 *  }}
 *  education - The education ID and all of the given info.
 *  document_x_education - The document ID that owns the education, the
 *  education ID, and the position of the education among other educations in
 *  the document.
 */
router.post(
  '/:documentId/educations',
  ensureLoggedIn,
  async (req, res, next) => {
    const userPayload = res.locals.user;
    const { username, documentId } = req.params;

    const logPrefix =
      `POST /users/${username}/documents/${documentId}/educations ` +
      `(user: ${JSON.stringify(userPayload)})`;
    logger.info(logPrefix + ' BEGIN');

    try {
      runJsonSchemaValidator(urlParamsSchema, { documentId }, logPrefix);
      runJsonSchemaValidator(educationNewSchema, req.body, logPrefix);

      const { education, document_x_education } = await createEducation(
        userPayload.username,
        documentId,
        req.body
      );

      return res.status(201).json({ education, document_x_education });
    } catch (err) {
      return next(err);
    }
  }
);

// ==================================================

module.exports = router;
