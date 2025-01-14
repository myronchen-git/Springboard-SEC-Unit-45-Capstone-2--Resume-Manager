'use strict';

const User = require('./user');
const { db } = require('../app');
const { AppServerError } = require('../errors/appErrors');
const { RegistrationError, SigninError } = require('../errors/userErrors');

// ==================================================

// Mock to bypass executing app code, but use actual "db" instance.
jest.mock('../app', () => ({
  db: new (require('../database/db'))(),
}));

// ==================================================

const existingUser = Object.freeze({ username: 'user1', password: '123' });

beforeEach(() => {
  return db.query({ text: 'TRUNCATE TABLE users CASCADE;' });
});

afterAll(() => {
  return db.shutdown();
});

// -------------------------------------------------- register

describe('register', () => {
  const newUser = Object.freeze({ username: 'new-user', password: '123' });

  test('Registers a new user.', async () => {
    // Act
    const user = await User.register(newUser);

    // Assert
    expect(user).toBeInstanceOf(User);
    expect(user.username).toBe(newUser.username);
  });

  test('Throws an Error if username is not available.', async () => {
    // Arrange
    await User.register(newUser);

    // Act
    async function runFunc() {
      await User.register(newUser);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(RegistrationError);
  });
});

// -------------------------------------------------- signin

describe('signin', () => {
  test('Signs in a user.', async () => {
    // Arrange
    await User.register(existingUser);

    // Act
    const user = await User.signin(existingUser);

    // Assert
    expect(user).toBeInstanceOf(User);
    expect(user.username).toBe(existingUser.username);
  });

  test('Throws an Error if username is not found.', async () => {
    // Act
    async function runFunc() {
      await User.signin(existingUser);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(SigninError);
  });

  test('Throws an Error if password is invalid.', async () => {
    // Arrange
    await User.register(existingUser);

    const wrongCredentials = Object.freeze({
      username: existingUser.username,
      password: 'wrong password',
    });

    // Act
    async function runFunc() {
      await User.signin(wrongCredentials);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(SigninError);
  });
});

// -------------------------------------------------- update

describe('update', () => {
  test("Updates a user's info.", async () => {
    // Arrange
    const user = await User.register(existingUser);
    const updatedInfo = Object.freeze({ password: 'updated' });

    // Act
    await user.update(updatedInfo);

    // Assert
    const userData = (
      await db.query({
        text: 'SELECT * FROM users WHERE username = $1;',
        values: [existingUser.username],
      })
    ).rows[0];

    expect(userData.password).toBe(updatedInfo.password);
  });

  test('Throws an Error if username is not found.', async () => {
    // Arrange
    const updatedInfo = Object.freeze({ password: 'updated' });
    const user = new User('nonexistent');

    // Act
    async function runFunc() {
      await user.update(updatedInfo);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(AppServerError);
  });
});

// -------------------------------------------------- delete

describe('delete', () => {
  test('Deletes a user.', async () => {
    // Arrange
    const user = await User.register(existingUser);

    // Act
    await user.delete();

    // Assert
    const data = await db.query({
      text: 'SELECT * FROM users WHERE username = $1;',
      values: [existingUser.username],
    });

    expect(data.rows.length).toBe(0);
  });

  test('Does not throw an Error if username is not found.', async () => {
    // Arrange
    const user = new User('nonexistent');

    // Act
    await user.delete();
  });
});
