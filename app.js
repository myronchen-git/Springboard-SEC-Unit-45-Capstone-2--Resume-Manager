/** Express app for Resume Manager. */

'use strict';

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const PostgresDb = require('./database/db');
const { NotFoundError } = require('./errors/appErrors');
const logger = require('./util/logger');

// ==================================================
// Start database connection.

const db = new PostgresDb();

// ==================================================
// Start app and configure routes, middleware, error handling, etc..

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('common', { stream: logger.stream }));

// --------------------------------------------------

/** Catch-all for handling 404 errors. */
app.use(function (req, res, next) {
  return next(new NotFoundError('URL path not found.'));
});

/** Generic error handler for anything unhandled. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') logger.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

// ==================================================

module.exports = { app, db };
