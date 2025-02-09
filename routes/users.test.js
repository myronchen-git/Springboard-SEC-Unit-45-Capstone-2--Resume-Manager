'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const { users } = require('../models/_testData');

// ==================================================

const urlPrefix = '/api/v1';
const urlRegisterUser = `${urlPrefix}/auth/register`;

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

  let authToken;

  beforeAll((done) => {
    request(app)
      .post(urlRegisterUser)
      .send({
        username: user.username,
        password: user.password,
      })
      .then((resp) => {
        authToken = resp.body.authToken;
      })
      .then(() => done());
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
