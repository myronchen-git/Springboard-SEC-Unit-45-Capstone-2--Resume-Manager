'use strict';

const request = require('supertest');

const app = require('../app');
const db = require('../database/db');

const User = require('../models/user');
const { users } = require('../models/_testData');
const { commonBeforeEach, commonAfterAll } = require('../_testCommon');

// ==================================================

const urlPrefix = '/api/v1';
const urlRegisterUser = `${urlPrefix}/auth/register`;

afterAll(() => commonAfterAll(db));

// --------------------------------------------------
// POST /auth/register

describe('POST /auth/register', () => {
  const url = urlRegisterUser;
  const user = users[0];

  beforeEach(() => commonBeforeEach(db, User.tableName));

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
    [{ username: 'user 123', password: user.password }],
    [{ username: 'user!', password: user.password }],
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

// --------------------------------------------------
// POST /auth/signin

describe('POST /auth/signin', () => {
  const url = `${urlPrefix}/auth/signin`;
  const user = users[0];

  beforeAll((done) => {
    db.query({
      text: `
  TRUNCATE TABLE ${User.tableName} RESTART IDENTITY CASCADE;`,
    })
      .then(() =>
        request(app).post(urlRegisterUser).send({
          username: user.username,
          password: user.password,
        })
      )
      .then(() => done());
  });

  test('Signs in a user.', async () => {
    // Act
    const resp = await request(app).post(url).send({
      username: user.username,
      password: user.password,
    });

    // Assert
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ authToken: expect.any(String) });
  });

  test.each([
    [
      {
        username: user.username,
        password: 'wrong password',
      },
    ],
    [
      {
        username: 'nonexistent',
        password: user.password,
      },
    ],
  ])(
    'Signing in with incorrect fields returns 401 status.  Fields: %o.',
    async (reqBody) => {
      // Act
      const resp = await request(app).post(url).send(reqBody);

      // Assert
      expect(resp.statusCode).toEqual(401);
      expect(resp.body).not.toHaveProperty('authToken');
    }
  );

  test.each([[{ username: user.username }], [{ password: user.password }]])(
    'Signing in a user without required fields returns 400 status.  Fields: %o.',
    async (reqBody) => {
      // Act
      const resp = await request(app).post(url).send(reqBody);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('authToken');
    }
  );

  // Tests the JSON schema.
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
  ])(
    'Signing in with invalid data returns 400 status.  Fields: %o.',
    async (reqBody) => {
      // Act
      const resp = await request(app).post(url).send(reqBody);

      // Assert
      expect(resp.statusCode).toEqual(400);
      expect(resp.body).not.toHaveProperty('authToken');
    }
  );
});
