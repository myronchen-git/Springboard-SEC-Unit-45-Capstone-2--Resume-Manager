'use strict';

const Section = require('./models/section');
const User = require('./models/user');

// ==================================================

async function commonBeforeAll(db) {
  return await db.query({
    queryConfig: {
      text:
        `
  TRUNCATE TABLE ${User.tableName}, ${Section.tableName} ` +
        'RESTART IDENTITY CASCADE;',
    },
  });
}

async function commonBeforeEach(db, tableName) {
  return await db.query({
    queryConfig: {
      text: `
  TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`,
    },
  });
}

async function commonAfterAll(db) {
  // Currently uses the same SQL statement as commonBeforeAll.  In the future,
  // write out the db.query call if the SQL changes.
  return await commonBeforeAll(db).then(() => db.shutdown());
}

// ==================================================

module.exports = { commonBeforeAll, commonBeforeEach, commonAfterAll };
