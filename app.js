/** Express app for Resume Manager. */

'use strict';

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const { authenticateJWT } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const { NotFoundError } = require('./errors/appErrors');

const logger = require('./util/logger');

// ==================================================
// Start app and configure routes, middleware, error handling, etc..

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common', { stream: logger.stream }));
app.use(authenticateJWT);

// --------------------------------------------------

const urlPrefix = '/api/v1';

app.use(`${urlPrefix}/auth`, authRoutes);

/** Catch-all for handling 404 errors. */
app.use(function (req, res, next) {
  return next(new NotFoundError('URL path not found.'));
});

/** Generic error handler for anything unhandled. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') logger.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message;

  return res.status(statusCode).json({
    error: { message, statusCode },
  });
});

// ==================================================

module.exports = app;
