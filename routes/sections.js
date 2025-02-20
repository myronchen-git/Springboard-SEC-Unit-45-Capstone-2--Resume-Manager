'use strict';

const express = require('express');

const Section = require('../models/section');

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

// ==================================================

module.exports = router;
