'use strict';

const Section = require('./section');
const { db } = require('../app');
const { AppServerError } = require('../errors/appErrors');

// ==================================================

// Mock to bypass executing app code, but use actual "db" instance.
jest.mock('../app', () => ({
  db: new (require('../database/db'))(),
}));

// ==================================================

describe('Section', () => {
  const existingUser = Object.freeze({ username: 'user1', password: '123' });

  const newSectionsProps = Object.freeze([
    Object.freeze({
      sectionName: 'section1',
    }),
    Object.freeze({
      sectionName: 'section2',
    }),
  ]);

  function getExpectedSectionData(sectionProps) {
    return {
      id: expect.any(Number),
      sectionName: sectionProps.sectionName,
    };
  }

  // To help with expects by directly getting data from the database.
  const sqlTextGetAll = `
  SELECT
    id,
    section_name AS "sectionName"
  FROM sections`;

  beforeAll(() => {
    return db.query({
      text: `
    INSERT INTO users VALUES
    ($1, $2);`,
      values: [existingUser.username, existingUser.password],
    });
  });

  beforeEach(() => {
    return db.query({ text: 'TRUNCATE TABLE sections CASCADE;' });
  });

  afterAll((done) => {
    db.query({ text: 'TRUNCATE TABLE users CASCADE;' })
      .then(() => db.shutdown())
      .then(() => done());
  });

  // -------------------------------------------------- add

  describe('add', () => {
    // Arrange
    const sectionProps = newSectionsProps[0];
    const expectedSectionData = getExpectedSectionData(sectionProps);

    test('Adds a new section.', async () => {
      // Act
      const section = await Section.add(sectionProps);

      // Assert
      expect(section).toBeInstanceOf(Section);
      expect(section).toEqual(expectedSectionData);

      const databaseSectionData = (
        await db.query({
          text: sqlTextGetAll + '\n  WHERE id = $1;',
          values: [section.id],
        })
      ).rows[0];

      expect(databaseSectionData).toEqual(expectedSectionData);
    });
  });
});
