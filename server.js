'use strict';

const { app } = require('./app');
const { PORT } = require('./config');

// ==================================================

/** Starts the server. */
app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
