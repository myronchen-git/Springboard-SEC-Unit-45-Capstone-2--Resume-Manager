'use strict';

const Section = require('./models/section');
const User = require('./models/user');

// ==================================================

async function commonBeforeEach(db, tableName) {
  return await db.query({
    text: `
  TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`,
  });
}

async function commonAfterAll(db) {
  return await db
    .query({
      text:
        `
  TRUNCATE TABLE ${User.tableName}, ${Section.tableName} ` +
        'RESTART IDENTITY CASCADE;',
    })
    .then(() => db.shutdown());
}

// ==================================================

module.exports = { commonBeforeEach, commonAfterAll };
