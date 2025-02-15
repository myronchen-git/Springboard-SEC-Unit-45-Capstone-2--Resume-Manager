'use strict';

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
      text: `
  TRUNCATE TABLE users, sections RESTART IDENTITY CASCADE;`,
    })
    .then(() => db.shutdown());
}

// ==================================================

module.exports = { commonBeforeEach, commonAfterAll };
