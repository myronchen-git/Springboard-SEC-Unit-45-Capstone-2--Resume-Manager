'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const Document = require('../models/document');
const { users, documents } = require('../models/_testData');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
} = require('../_testCommon');

// ==================================================

const urlPrefix = '/api/v1';
const urlRegisterUser = `${urlPrefix}/auth/register`;
const getUrlNewDocument = (username) =>
  `${urlPrefix}/users/${username}/documents`;

const authTokens = [];

beforeAll(() =>
  commonBeforeAll(db)
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

beforeEach(() => commonBeforeEach(db, Document.tableName));

afterAll(() => commonAfterAll(db));

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

// --------------------------------------------------
// PATCH /users/:username/documents/:docId

describe('PATCH /users/:username/documents/:docId', () => {
  const getUrl = (username, docId) =>
    `${urlPrefix}/users/${username}/documents/${docId}`;
  const user = users[0];
  const document = documents[0];
  let authToken;
  let docId;

  // Need to set authToken in beforeAll, because all variable declarations
  // outside of these setup functions are run first.
  beforeAll(() => {
    authToken = authTokens[0];
  });

  beforeEach((done) => {
    request(app)
      .post(getUrlNewDocument(user.username))
      .send({
        documentName: document.documentName,
        isTemplate: document.isTemplate,
      })
      .set('authorization', `Bearer ${authToken}`)
      .then((resp) => (docId = resp.body.document.id))
      .then(() => done());
  });

  test('Updates a document.', async () => {
    // Arrange
    const updateData = Object.freeze({
      documentName: 'New name',
      isTemplate: !document.isTemplate,
      isLocked: true,
    });

    // Act
    const resp = await request(app)
      .patch(getUrl(user.username, docId))
      .send(updateData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(200);

    const expectedDocument = {
      id: expect.any(Number),
      documentName: updateData.documentName,
      owner: user.username,
      createdOn: expect.any(String),
      lastUpdated: expect.any(String),
      isMaster: false,
      isTemplate: updateData.isTemplate,
      isLocked: true,
    };

    expect(resp.body).toEqual({ document: expectedDocument });
    expect(Date.parse(resp.body.document.createdOn)).not.toBeNaN();
    expect(Date.parse(resp.body.document.lastUpdated)).not.toBeNaN();
  });

  test('Updating with no properties should return 400 status.', async () => {
    // Arrange
    const updateData = {};

    // Act
    const resp = await request(app)
      .patch(getUrl(user.username, docId))
      .send(updateData)
      .set('authorization', `Bearer ${authToken}`);

    expect(resp.statusCode).toBe(400);
    expect(resp.body).not.toHaveProperty('document');
  });

  test('Updating a nonexistent document should return 404 status.', async () => {
    // Arrange
    const nonexistentDocId = 999;

    const updateData = Object.freeze({
      documentName: 'New name',
      isTemplate: !document.isTemplate,
      isLocked: true,
    });

    // Act
    const resp = await request(app)
      .patch(getUrl(user.username, nonexistentDocId))
      .send(updateData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(404);
    expect(resp.body).not.toHaveProperty('document');
  });
});
