'use strict';

const bcrypt = require('bcrypt');

const { BCRYPT_WORK_FACTOR } = require('../config');
const { db } = require('../app');
const { AppServerError } = require('../errors/appErrors');
const { RegistrationError, SigninError } = require('../errors/userErrors');
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
    const logPrefix =
      `User.register(` + `{ username: '${username}', password: (password) })`;
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
        throw new RegistrationError(`Username "${username}" is not available.`);
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
    const logPrefix =
      `User.signin(` + `{ username: '${username}', password: (password) })`;
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

    logger.error(
      `${logPrefix}: Invalid username/password when signing into "${username}".`
    );
    throw new SigninError('Invalid username/password.');
  }

  /**
   * Updates a user entry in the database.  Currently, this only updates the
   * password.  In the future, this might update other info.  If that's the
   * case, then this would need to return the updated info.
   *
   * @param {Object} data - Contains data for updating an account.
   * @param {String} data.password - New password for the account.
   */
  async update({ password }) {
    const logPrefix = `User.update({ password: (password) })`;
    logger.verbose(logPrefix + `: Updating info for "${this.username}".`);

    const queryConfig = {
      text: `
      UPDATE users
      SET password = $1
      WHERE username = $2;`,
      values: [password, this.username],
    };

    let result;
    try {
      result = await db.query(queryConfig);
    } catch (err) {
      logger.error(`${logPrefix}: ${err}`);
      throw err;
    }

    if (result.rowCount === 0) {
      logger.error(`${logPrefix}: Username "${this.username}" not found.`);
      throw new AppServerError(`Username "${this.username}" not found.`);
    }
  }

  /**
   * Deletes a user entry in the database.  Does not delete the username
   * instance variable.  Remember to delete the User instance this belongs to!
   */
  async delete() {
    const logPrefix = `User.delete()`;
    logger.verbose(logPrefix + `: Deleting "${this.username}".`);

    const queryConfig = {
      text: `
      DELETE FROM users
      WHERE username = $1;`,
      values: [this.username],
    };

    let result;
    try {
      result = await db.query(queryConfig);
    } catch (err) {
      logger.error(`${logPrefix}: ${err}`);
      throw err;
    }

    logger.info(`${logPrefix}: ${result.rowCount} user(s) deleted.`);
  }
}

// ==================================================

module.exports = User;
