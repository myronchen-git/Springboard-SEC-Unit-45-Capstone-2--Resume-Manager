'use strict';

const { db } = require('../app');
const TextSnippet = require('./textSnippet');

const { users } = require('./_testData');
const {
  dataForNewInstances,
  dataForUpdate,
  whereClauseToGetAll,
} = require('./_textSnippetTestData');

// ==================================================

// Mock to bypass executing app code, but use actual "db" instance.
jest.mock('../app', () => ({
  db: new (require('../database/db'))(),
}));

// ================================================== Set Up Variables

const ClassRef = TextSnippet;
const className = 'TextSnippet';
const tableName = 'text_snippets';

// ================================================== Specific Tests

describe(className, () => {
  // To help with expects by directly getting data from the database.
  const sqlTextSelectAll = `
SELECT ${ClassRef._allDbColsAsJs}
FROM ${tableName}`;

  beforeAll(() => {
    return db.query({
      text: `
INSERT INTO users VALUES
($1, $2);`,
      values: [users[0].username, users[0].password],
    });
  });

  beforeEach(() => {
    return db.query({
      text: `
TRUNCATE TABLE ${tableName} CASCADE;`,
    });
  });

  afterAll((done) => {
    db.query({
      text: `
TRUNCATE TABLE users, sections RESTART IDENTITY CASCADE;`,
    })
      .then(() => db.shutdown())
      .then(() => done());
  });

  // -------------------------------------------------- delete

  describe('delete', () => {
    test(
      'Deleting an old version of a snippet should only set the new ' +
        "versions' parent property to null.",
      async () => {
        // Arrange
        const oldTextSnippet = await ClassRef.add(dataForNewInstances[0]);
        const newTextSnippet = await oldTextSnippet.update(dataForUpdate[0]);

        newTextSnippet.parent = null;

        // Act
        await oldTextSnippet.delete();

        // Assert
        const databaseEntries = (
          await db.query({
            text: sqlTextSelectAll + `\n  ${whereClauseToGetAll};`,
            values: [users[0].username],
          })
        ).rows;

        expect(databaseEntries.length).toBe(1);
        expect(databaseEntries[0]).toEqual(newTextSnippet);
      }
    );
  });
});
