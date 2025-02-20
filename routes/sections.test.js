'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const { sections } = require('../_testData');
const { commonBeforeAll, commonAfterAll } = require('../_testCommon');

// ==================================================

const urlPrefix = '/api/v1';

beforeAll(() =>
  commonBeforeAll(db).then(() => {
    // Have to manually and directly insert sections here, because sections are
    // pre-created.  In other words, they are seeded into the database upon
    // database creation and not created thru the API.
    const sqlValuesText = sections.map(
      (section) => `\n    ('${section.sectionName}')`
    );
    const text =
      `
  INSERT INTO sections (section_name) VALUES` +
      sqlValuesText.join() +
      ';';

    return db.query({ text });
  })
);

afterAll(() => commonAfterAll(db));

// --------------------------------------------------
// GET /sections

describe('GET /sections', () => {
  const url = `${urlPrefix}/sections`;

  test('Gets all pre-created sections.', async () => {
    // Act
    const resp = await request(app).get(url);

    // Assert
    expect(resp.statusCode).toBe(200);

    const expectedSections = sections.map((section, idx) => ({
      id: idx + 1,
      sectionName: section.sectionName,
    }));

    expect(resp.body).toEqual({ sections: expectedSections });
  });
});
