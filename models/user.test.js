'use strict';

const User = require('./user');
const { db } = require('../app');
const { RegistrationError, SigninError } = require('../errors/userErrors');

// ==================================================

// Mock to bypass executing app code, but use actual "db" instance.
jest.mock('../app', () => ({
  db: new (require('../database/db'))(),
}));

beforeEach(() => {
  return db.query({ text: 'TRUNCATE TABLE users CASCADE' });
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
    expect(user.username).toEqual(newUser.username);
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
  const existingUser = Object.freeze({ username: 'user1', password: '123' });

  test('Signs in a user.', async () => {
    // Arrange
    await User.register(existingUser);

    // Act
    const user = await User.signin(existingUser);

    // Assert
    expect(user).toBeInstanceOf(User);
    expect(user.username).toEqual(existingUser.username);
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
