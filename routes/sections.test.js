'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const Document = require('../models/document');
const Document_X_Section = require('../models/document_x_section');
const { users, sections } = require('../_testData');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
} = require('../_testCommon');

// ==================================================

const urlPrefix = '/api/v1';
const urlRegisterUser = `${urlPrefix}/auth/register`;

const authTokens = [];

beforeAll(() =>
  commonBeforeAll(db)
    .then(() => {
      // Have to manually and directly insert sections here, because sections
      // are pre-created.  In other words, they are seeded into the database
      // upon database creation and not created thru the API.
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
    .then(() =>
      Promise.all(
        users.map((user) =>
          request(app).post(urlRegisterUser).send({
            username: user.username,
            password: user.password,
          })
        )
      )
    )
    .then((responses) => {
      responses.forEach((resp) => authTokens.push(resp.body.authToken));
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

// --------------------------------------------------
// POST /users/:username/documents/:docId/sections/:sectionId

describe('POST /users/:username/documents/:docId/sections/:sectionId', () => {
  const getUrl = (username, docId, sectionId) =>
    `${urlPrefix}/users/${username}/documents/${docId}/sections/${sectionId}`;
  const user = users[0];

  // Need to set authToken in beforeAll, because all variable declarations
  // outside of these setup functions are run first.
  let authToken;
  beforeAll(() => {
    authToken = authTokens[0];
  });

  beforeEach(() => commonBeforeEach(db, Document_X_Section.tableName));

  test('Adds a new document-section relationship.', async () => {
    // Arrange
    const docId = (await Document.getAll(user.username))[0].id;
    const sectionId = 1;

    // Act
    const resp = await request(app)
      .post(getUrl(user.username, docId, sectionId))
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(201);

    const expectedDocument_x_section = {
      documentId: docId,
      sectionId: sectionId,
      position: 0,
    };

    expect(resp.body).toEqual({
      document_x_section: expectedDocument_x_section,
    });
  });

  test(
    'Adds a new document-section relationship at the correct position ' +
      'if there already exists multiples.',
    async () => {
      // Ensure that there are enough sections.
      expect(sections.length).toBeGreaterThanOrEqual(2);

      // Arrange
      const docId = (await Document.getAll(user.username))[0].id;

      await request(app)
        .post(getUrl(user.username, docId, 1))
        .set('authorization', `Bearer ${authToken}`);

      // Act
      const resp = await request(app)
        .post(getUrl(user.username, docId, 2))
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(201);

      const expectedDocument_x_section = {
        documentId: docId,
        sectionId: 2,
        position: 1,
      };

      expect(resp.body).toEqual({
        document_x_section: expectedDocument_x_section,
      });
    }
  );

  test(
    'Adding a relationship with a nonexistent document ' +
      'should return 404 status.',
    async () => {
      // Arrange
      const nonexistentDocId = 99;
      const sectionId = 1;

      // Act
      const resp = await request(app)
        .post(getUrl(user.username, nonexistentDocId, sectionId))
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(404);
      expect(resp.body).not.toHaveProperty('document_x_section');
    }
  );

  test(
    "Attempting to access another user's document " +
      'should return 403 status.',
    async () => {
      // Ensure there are enough users.
      expect(users.length).toBeGreaterThanOrEqual(2);

      // Arrange
      const docId = (await Document.getAll(users[0].username))[0].id;
      const sectionId = 1;

      // Act
      const resp = await request(app)
        .post(getUrl(users[0].username, docId, sectionId))
        .set('authorization', `Bearer ${authTokens[1]}`);

      // Assert
      expect(resp.statusCode).toBe(403);
      expect(resp.body).not.toHaveProperty('document_x_section');
    }
  );
});
