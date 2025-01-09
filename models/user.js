'use strict';

const bcrypt = require('bcrypt');

const { BCRYPT_WORK_FACTOR } = require('../config');
const { db } = require('../app');
const logger = require('../util/logger');

// ==================================================

/**
 * Represents a user account.
 */
class User {
  constructor(username) {
    this.username = username;
  }

  /**
   * Creates a new user entry into the database.
   *
   * @param {Object} data - Contains data for creating a new account.
   * @param {String} data.username - Name of the account.
   * @param {String} data.password - Password of the account.
   * @returns {User} A new User instance that contains the user's data.
   */
  static async register({ username, password }) {
    const logPrefix = `User.register({ '${username}', (password) })`;
    logger.verbose(logPrefix);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const queryConfig = {
      text: `
      INSERT INTO users VALUES
      ($1, $2)
      RETURNING username;`,
      values: [username, hashedPassword],
    };

    let result;
    try {
      result = await db.query(queryConfig);
    } catch (err) {
      logger.error(`${logPrefix}: ${err}`);

      // PostgreSQL error code 23505 is for unique constraint violation.
      if (err.code === '23505') {
        throw new Error(`Username "${username}" is not available.`);
      } else {
        throw err;
      }
    }

    const data = result.rows[0];
    return new User(data.username);
  }

  /**
   * Signs/logs in a user.
   *
   * @param {Object} data - Contains data for signing into an account.
   * @param {String} data.username - Name of the account.
   * @param {String} data.password - Password of the account.
   * @returns {User} A new User instance that contains the user's data.
   */
  static async signin({ username, password }) {
    const logPrefix = `User.signin({ '${username}', (password) })`;
    logger.verbose(logPrefix);

    const queryConfig = {
      text: `
      SELECT username, password
      FROM users
      WHERE username = $1;`,
      values: [username],
    };

    let result;
    try {
      result = await db.query(queryConfig);
    } catch (err) {
      logger.error(`${logPrefix}: ${err}`);
      throw err;
    }

    const data = result.rows[0];
    if (data && (await bcrypt.compare(password, data.password)))
      return new User(data.username);

    throw new Error('Invalid username/password.');
  }
}

// ==================================================

module.exports = User;
