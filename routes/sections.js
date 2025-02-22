'use strict';

const express = require('express');

const document_x_sectionNewSchema = require('../schemas/document_x_sectionNew.json');

const Section = require('../models/section');
const { createDocument_x_section } = require('../services/sectionService');
const { ensureLoggedIn } = require('../middleware/auth');
const { runJsonSchemaValidator } = require('../util/validators');

const logger = require('../util/logger');

// ==================================================

const router = new express.Router();

// --------------------------------------------------

/**
 * GET /sections
 * {} => { sections }
 *
 * Authorization required: none
 *
 * @returns {Object} sections - Returns a list of sections that can be used in
 *  documents.
 */
router.get('/sections', async (req, res, next) => {
  const logPrefix = 'GET /sections';
  logger.info(logPrefix + ' BEGIN');

  try {
    const sections = await Section.getAll();
    return res.json({ sections });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /users/:username/documents/:docId/sections/:sectionId
 * {} => { document_x_section }
 *
 * Authorization required: login
 *
 * Creates document-section relationship.
 *
 * @returns {Object} document_x_section - The document ID, section ID, and
 *  position of section within document.
 */
router.post(
  '/users/:username/documents/:docId/sections/:sectionId',
  ensureLoggedIn,
  async (req, res, next) => {
    const userPayload = res.locals.user;

    const logPrefix =
      'POST /users/:username/documents/:docId/sections/:sectionId (' +
      `user: ${JSON.stringify(userPayload)})`;
    logger.info(logPrefix + ' BEGIN');

    const { docId, sectionId } = req.params;

    try {
      runJsonSchemaValidator(
        document_x_sectionNewSchema,
        { docId, sectionId },
        logPrefix
      );

      const document_x_section = await createDocument_x_section(
        userPayload.username,
        docId,
        sectionId
      );

      res.status(201).json({ document_x_section });
    } catch (err) {
      return next(err);
    }
  }
);

// ==================================================

module.exports = router;
