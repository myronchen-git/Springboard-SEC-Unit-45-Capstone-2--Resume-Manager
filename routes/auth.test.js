'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const { users } = require('../models/_testData');

// ==================================================

const urlPrefix = '/api/v1';

beforeEach(() => {
  return db.query({
    text: `
TRUNCATE TABLE users RESTART IDENTITY CASCADE;`,
  });
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
// POST /auth/register

describe('POST /auth/register', () => {
  const url = `${urlPrefix}/auth/register`;
  const user = users[0];

  test('Registers a user.', async () => {
    // Act
    const resp = await request(app).post(url).send({
      username: user.username,
      password: user.password,
    });

    // Assert
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ authToken: expect.any(String) });
  });

  test('Registering an already taken username returns 400 status.', async () => {
    // Arrange
    const newUserData = { username: user.username, password: user.password };
    await request(app).post(url).send(newUserData);

    // Act
    const resp = await request(app).post(url).send(newUserData);

    // Assert
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).not.toHaveProperty('authToken');
  });

  test.each([[{ username: user.username }], [{ password: user.password }]])(
    'Registering a user without required fields returns 400 status.  Fields: %o.',
    async (reqBody) => {
      // Act
      const resp = await request(app).post(url).send(reqBody);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('authToken');
    }
  );

  // Also tests the JSON schema.
  test.each([
    [{ username: 'us', password: user.password }],
    [
      {
        username: 'user123456789012345678901234567890',
        password: user.password,
      },
    ],
    [{ username: user.username, password: '1' }],
    [
      {
        username: user.username,
        password: '12345678901234567890Ab!',
      },
    ],
    [{ username: user.username, password: '1234567890' }],
    [{ username: user.username, password: 'abcdefghi' }],
    [{ username: user.username, password: 'ABCDEFGHI' }],
    [{ username: user.username, password: '1234567890Ab' }],
  ])(
    'Registering with invalid data returns 400 status.  Fields: %o.',
    async (reqBody) => {
      // Act
      const resp = await request(app).post(url).send(reqBody);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('authToken');
    }
  );
});
