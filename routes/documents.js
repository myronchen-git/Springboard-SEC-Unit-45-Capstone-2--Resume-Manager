'use strict';

const express = require('express');

const documentNewSchema = require('../schemas/documentNew.json');

const Document = require('../models/document');
const { ensureLoggedIn } = require('../middleware/auth');
const { runJsonSchemaValidator } = require('../util/validators');

const logger = require('../util/logger');

// ==================================================

const router = new express.Router();

// --------------------------------------------------

/**
 * POST /users/:username/documents
 * { documentName, isTemplate } => { document }
 *
 * Authorization required: login
 *
 * @param {String} documentName - Name of the document.
 * @param {Boolean} isTemplate - Whether this new document should be a template.
 * @returns {Object} document - Returns all info of the document.
 */
router.post('/', ensureLoggedIn, async (req, res, next) => {
  const userPayload = res.locals.user;

  const logPrefix =
    'POST /users/:username/documents (' +
    `user: ${JSON.stringify(userPayload)}, ` +
    `request body: ${JSON.stringify(req.body)})`;
  logger.verbose(logPrefix + ': BEGIN');

  try {
    runJsonSchemaValidator(documentNewSchema, req.body, logPrefix);

    const document = await Document.add({
      ...req.body,
      owner: userPayload.username,
      isMaster: false,
    });

    return res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /users/:username/documents
 * {} => { documents }
 *
 * Authorization required: login
 *
 * @returns {Object} documents - Returns a list of documents containing all info
 *  of each document.
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
  const userPayload = res.locals.user;

  const logPrefix =
    'GET /users/:username/documents (' +
    `user: ${JSON.stringify(userPayload)})`;
  logger.verbose(logPrefix + ': BEGIN');

  try {
    const documents = await Document.getAll(userPayload.username);

    return res.json({ documents });
  } catch (err) {
    return next(err);
  }
});

// ==================================================

module.exports = router;
