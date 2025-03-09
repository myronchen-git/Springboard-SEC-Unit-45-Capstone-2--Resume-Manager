'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const Document_X_Education = require('../models/document_x_education');
const { users, educations } = require('../_testData');
const {
  urlRegisterUser,
  getDocumentsGeneralUrl,
  getEducationsGeneralUrl,
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
} = require('../_testCommon');

// ==================================================

const authTokens = [];
const masterDocumentIds = [];

beforeAll(async () => {
  // Clear all tables.
  await commonBeforeAll(db);

  // Creating users.
  let responses = await Promise.all(
    users.map((user) =>
      request(app).post(urlRegisterUser).send({
        username: user.username,
        password: user.password,
      })
    )
  );

  // Saving the authentication tokens for users.
  responses.forEach((resp) => authTokens.push(resp.body.authToken));

  // Getting the master resume for each user.
  responses = await Promise.all(
    users.map((user, i) =>
      request(app)
        .get(getDocumentsGeneralUrl(user.username))
        .set('authorization', `Bearer ${authTokens[i]}`)
    )
  );

  // Saving the IDs of the master resumes.
  responses.forEach((resp) =>
    masterDocumentIds.push(resp.body.documents[0].id)
  );
});

afterAll(() => commonAfterAll(db));

// --------------------------------------------------
// POST /users/:username/documents/:documentId/educations

describe('POST /users/:username/documents/:documentId/educations', () => {
  const username = users[0].username;

  const educationsForRawClientInputs = educations.map((education) => {
    const educationCopy = { ...education };
    delete educationCopy.owner;
    return educationCopy;
  });

  beforeEach(() => commonBeforeEach(db, Document_X_Education.tableName));

  test.each([
    [educationsForRawClientInputs[0]],
    [educationsForRawClientInputs[1]],
  ])('Adds a new education to a document.', async (educationInputData) => {
    // Arrange
    const authToken = authTokens[0];
    const documentId = masterDocumentIds[0];

    // Act
    const resp = await request(app)
      .post(getEducationsGeneralUrl(username, documentId))
      .send(educationInputData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(201);

    const expectedEducation = {
      ...educationInputData,
      id: expect.any(Number),
      owner: username,
      gpa: educationInputData.gpa ?? null,
      awardsAndHonors: educationInputData.awardsAndHonors ?? null,
      activities: educationInputData.activities ?? null,
    };
    const expectedDocument_x_education = {
      documentId,
      educationId: expect.any(Number),
      position: 0,
    };

    expect(resp.body).toEqual({
      education: expectedEducation,
      document_x_education: expectedDocument_x_education,
    });
  });

  // To be uncommented after completing PUT and DELETE routes.
  /*
  test(
    'Adds a new education to a document at the correct position ' +
      'when there are multiple non-sequential, out-of-order educations.',
    async () => {
      // Arrange
      const authToken = authTokens[0];
      const documentId = masterDocumentIds[0];
      const educationInputData = educationsForRawClientInputs[0];

      for (let i = 0; i < 4; i++) {
        await request(app)
          .post(getEducationsGeneralUrl(username, documentId))
          .send(educationInputData)
          .set('authorization', `Bearer ${authToken}`);
      }

      await request(app)
        .put(getEducationsGeneralUrl(username, documentId))
        .send([4, 1, 2, 3])
        .set('authorization', `Bearer ${authToken}`);

      await request(app)
        .delete(getEducationsSpecificUrl(username, documentId, 1))
        .set('authorization', `Bearer ${authToken}`);

      // Act
      const resp = await request(app)
        .post(getEducationsGeneralUrl(username, documentId))
        .send(educationInputData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(201);

      expect(resp.body.document_x_education.position).toBe(4);
    }
  );
  */

  test('Giving an invalid document ID in the URL should return 400 status.', async () => {
    // Arrange
    const authToken = authTokens[0];
    const documentId = 'invalid';
    const educationInputData = educationsForRawClientInputs[0];

    // Act
    const resp = await request(app)
      .post(getEducationsGeneralUrl(username, documentId))
      .send(educationInputData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(400);
    expect(resp.body).not.toHaveProperty('education');
    expect(resp.body).not.toHaveProperty('document_x_education');
  });

  test('Giving an invalid education property should return 400 status.', async () => {
    // Arrange
    const authToken = authTokens[0];
    const documentId = masterDocumentIds[0];
    const educationInputData = { ...educationsForRawClientInputs[0] };

    educationInputData.startDate = '03-03-2003';

    // Act
    const resp = await request(app)
      .post(getEducationsGeneralUrl(username, documentId))
      .send(educationInputData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toBe(400);
    expect(resp.body).not.toHaveProperty('education');
    expect(resp.body).not.toHaveProperty('document_x_education');
  });

  test(
    'Adding to a document that is not the master resume ' +
      'should return 403 status.',
    async () => {
      // Arrange
      const authToken = authTokens[0];
      const educationInputData = educationsForRawClientInputs[0];

      let resp = await request(app)
        .post(getDocumentsGeneralUrl(username))
        .send({
          documentName: 'Not Master',
          isTemplate: false,
        })
        .set('authorization', `Bearer ${authToken}`);

      const documentId = resp.body.document.id;

      // Act
      resp = await request(app)
        .post(getEducationsGeneralUrl(username, documentId))
        .send(educationInputData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(403);
      expect(resp.body).not.toHaveProperty('education');
      expect(resp.body).not.toHaveProperty('document_x_education');
    }
  );

  test(
    'Adding an education to a nonexistent document ' +
      'should return 404 status.',
    async () => {
      // Arrange
      const authToken = authTokens[0];
      const nonexistentDocumentId = 999;
      const educationInputData = educationsForRawClientInputs[0];

      // Act
      const resp = await request(app)
        .post(getEducationsGeneralUrl(username, nonexistentDocumentId))
        .send(educationInputData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(404);
      expect(resp.body).not.toHaveProperty('education');
      expect(resp.body).not.toHaveProperty('document_x_education');
    }
  );

  test(
    "Attempting to access another user's document " +
      'should return 403 status.',
    async () => {
      // Arrange
      const authToken = authTokens[0];
      const documentId = masterDocumentIds[1];
      const educationInputData = educationsForRawClientInputs[0];

      // Act
      const resp = await request(app)
        .post(getEducationsGeneralUrl(username, documentId))
        .send(educationInputData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toBe(403);
      expect(resp.body).not.toHaveProperty('education');
      expect(resp.body).not.toHaveProperty('document_x_education');
    }
  );
});
