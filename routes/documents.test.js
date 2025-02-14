'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const { users, documents } = require('../models/_testData');

// ==================================================

const urlPrefix = '/api/v1';
const urlRegisterUser = `${urlPrefix}/auth/register`;
const getUrlNewDocument = (username) =>
  `${urlPrefix}/users/${username}/documents`;

const authTokens = [];

beforeAll((done) => {
  Promise.all(
    users.map((user) =>
      request(app).post(urlRegisterUser).send({
        username: user.username,
        password: user.password,
      })
    )
  )
    .then((responses) => {
      responses.forEach((resp) => authTokens.push(resp.body.authToken));
    })
    .then(() => done());
});

afterAll((done) => {
  db.query({
    text: `
  TRUNCATE TABLE users RESTART IDENTITY CASCADE;`,
  })
    .then(() => db.shutdown())
    .then(() => done());
});

// --------------------------------------------------
// POST /users/:username/documents

describe('POST /users/:username/documents', () => {
  const user = users[0];
  const document = documents[0];

  // Need to set authToken in beforeAll, because all variable declarations
  // outside of these setup functions are run first.
  let authToken;
  beforeAll(() => {
    authToken = authTokens[0];
  });

  beforeEach(() => {
    return db.query({
      text: `
  TRUNCATE TABLE documents RESTART IDENTITY CASCADE;`,
    });
  });

  test('Adds a new document.', async () => {
    // Arrange
    const newDocumentData = {
      documentName: document.documentName,
      isTemplate: document.isTemplate,
    };

    // Act
    const resp = await request(app)
      .post(getUrlNewDocument(user.username))
      .send(newDocumentData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(201);

    const expectedDocument = {
      id: expect.any(Number),
      documentName: document.documentName,
      owner: user.username,
      createdOn: expect.any(String),
      lastUpdated: null,
      isMaster: false,
      isTemplate: document.isTemplate,
      isLocked: false,
    };

    expect(resp.body).toEqual({
      document: expectedDocument,
    });

    expect(Date.parse(resp.body.document.createdOn)).not.toBeNaN();
  });

  test.each([
    [{ documentName: document.documentName }],
    [{ isTemplate: document.isTemplate }],
  ])(
    'Creating a new document without required fields should ' +
      'return 400 status.  Fields: %o.',
    async (newDocumentData) => {
      // Act
      const resp = await request(app)
        .post(getUrlNewDocument(user.username))
        .send(newDocumentData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(400);
      expect(resp.body).not.toHaveProperty('document');
    }
  );
});

// --------------------------------------------------
// GET /users/:username/documents

describe('GET /users/:username/documents', () => {
  const getUrl = (username) => `${urlPrefix}/users/${username}/documents`;
  const user = users[0];

  // Need to set authToken in beforeAll, because all variable declarations
  // outside of these setup functions are run first.
  let authToken;
  beforeAll(() => {
    authToken = authTokens[0];
  });

  beforeEach(() => {
    return db.query({
      text: `
  TRUNCATE TABLE documents RESTART IDENTITY CASCADE;`,
    });
  });

  test('Retrieves all documents for a user.', async () => {
    // Arrange
    await Promise.all(
      documents.map((document) =>
        request(app)
          .post(getUrlNewDocument(user.username))
          .send({
            documentName: document.documentName,
            isTemplate: document.isTemplate,
          })
          .set('authorization', `Bearer ${authToken}`)
      )
    );

    // Act
    const resp = await request(app)
      .get(getUrl(user.username))
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(200);

    const expectedDocuments = documents.map((document) => ({
      id: expect.any(Number),
      documentName: document.documentName,
      owner: user.username,
      createdOn: expect.any(String),
      lastUpdated: null,
      isMaster: false,
      isTemplate: document.isTemplate,
      isLocked: false,
    }));

    expect(resp.body).toEqual({
      documents: expectedDocuments,
    });
  });

  test('Returns no documents if they do not exist.', async () => {
    // Act
    const resp = await request(app)
      .get(getUrl(user.username))
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ documents: [] });
  });
});
