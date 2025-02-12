'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const { users, contactInfos } = require('../models/_testData');

// ==================================================

const urlPrefix = '/api/v1';
const urlRegisterUser = `${urlPrefix}/auth/register`;

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
// PATCH /users/:username

describe('PATCH /users/:username', () => {
  const user = users[0];
  const url = `${urlPrefix}/users/${user.username}`;
  const validNewPassword = 'Updated12345!@#$%';

  // Need to set authToken in beforeAll, because all variable declarations
  // outside of these setup functions are run first.
  let authToken;
  beforeAll(() => {
    authToken = authTokens[0];
  });

  test('Updates user account data.', async () => {
    // Arrange
    const updateData = Object.freeze({
      oldPassword: user.password,
      newPassword: validNewPassword,
    });

    // Act
    const resp = await request(app)
      .patch(url)
      .send(updateData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    const expectedUserData = { ...user, ...updateData };
    delete expectedUserData.password;
    delete expectedUserData.oldPassword;
    delete expectedUserData.newPassword;

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: expectedUserData,
    });
  });

  test(
    'Updating user account data with no data ' + 'should return 400 status.',
    async () => {
      // Arrange
      const updateData = Object.freeze({});

      // Act
      const resp = await request(app)
        .patch(url)
        .send(updateData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('user');
    }
  );

  test(
    'Updating password without giving old password ' +
      'should return 400 status.',
    async () => {
      // Arrange
      const updateData = Object.freeze({ newPassword: validNewPassword });

      // Act
      const resp = await request(app)
        .patch(url)
        .send(updateData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('user');
    }
  );

  test(
    'Updating password with incorrect old password ' +
      'should return 401 status.',
    async () => {
      // Arrange
      const updateData = Object.freeze({
        oldPassword: 'wrong password',
        newPassword: validNewPassword,
      });

      // Act
      const resp = await request(app)
        .patch(url)
        .send(updateData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toEqual(401);
      expect(resp.body).not.toHaveProperty('user');
    }
  );

  test(
    'Updating password with invalid new password ' +
      'should return 400 status.',
    async () => {
      // Arrange
      const updateData = Object.freeze({
        oldPassword: user.password,
        newPassword: '1',
      });

      // Act
      const resp = await request(app)
        .patch(url)
        .send(updateData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('user');
    }
  );
});

// --------------------------------------------------
// PUT /users/:username/contact-info

describe('PUT /users/:username/contact-info', () => {
  const getUrl = (username) => `${urlPrefix}/users/${username}/contact-info`;

  afterEach(() => {
    return db.query({
      text: `
  TRUNCATE TABLE contact_info RESTART IDENTITY CASCADE;`,
    });
  });

  test.each(contactInfos.map((info, idx) => [idx, { ...info }]))(
    'Adds a contact info entry into database if one does not exist.  ' +
      'Field %i: %o.',
    async (idx, contactInfoData) => {
      // Arrange
      const expectedContactInfoData = { ...contactInfoData };
      expectedContactInfoData.location ||= null;
      expectedContactInfoData.email ||= null;
      expectedContactInfoData.phone ||= null;
      expectedContactInfoData.linkedin ||= null;
      expectedContactInfoData.github ||= null;

      delete contactInfoData.username;

      // Act
      const resp = await request(app)
        .put(getUrl(users[idx].username))
        .send(contactInfoData)
        .set('authorization', `Bearer ${authTokens[idx]}`);

      // Assert
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        contactInfo: expectedContactInfoData,
      });
    }
  );

  test(
    'Updates a contact info entry in the database ' + 'if it already exists.',
    async () => {
      // Arrange
      const authToken = authTokens[0];

      let contactInfoData = { ...contactInfos[0] };
      delete contactInfoData.username;

      await request(app)
        .put(getUrl(users[0].username))
        .send(contactInfoData)
        .set('authorization', `Bearer ${authToken}`);

      contactInfoData = { ...contactInfos[1] };
      const expectedContactInfoData = {
        ...contactInfoData,
        username: contactInfos[0].username,
      };
      delete contactInfoData.username;

      // Act
      const resp = await request(app)
        .put(getUrl(users[1].username))
        .send(contactInfoData)
        .set('authorization', `Bearer ${authToken}`);

      // Assert
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        contactInfo: expectedContactInfoData,
      });
    }
  );

  // Also testing the JSON schema regex pattern.
  test.each([
    ['Giving no contact info data', {}],
    ['Giving an invalid email', { email: 'not@email' }],
    ['Giving an invalid LinkedIn URL', { linkedin: 'linkedin.com/user/user1' }],
    ['Giving an invalid Github URL', { github: 'github/user1' }],
    [
      'Missing full name when creating a database entry',
      { location: contactInfos[1].location },
    ],
  ])('%s should return 400 status.', async (testTitle, contactInfoData) => {
    // Arrange
    const user = users[0];
    const authToken = authTokens[0];

    // Act
    const resp = await request(app)
      .put(getUrl(user.username))
      .send(contactInfoData)
      .set('authorization', `Bearer ${authToken}`);

    // Assert
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).not.toHaveProperty('contactInfo');
  });
});
