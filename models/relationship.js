'use strict';

const db = require('../database/db');

const {
  AppServerError,
  BadRequestError,
  NotFoundError,
} = require('../errors/appErrors');

const logger = require('../util/logger');

// ==================================================

/**
 * Generic superclass for data models of relationships between tables.  This is
 * used to consolidate duplicate code.
 */
class Relationship {
  /**
   * Creates a new table entry.
   *
   * @param {Object} props - Contains data for creating a new entry.
   * @param {Object} queryConfig - Configuration for the database query.
   * @param {String} queryConfig.text - SQL INSERT statement for the
   *  parameterized query, along with a RETURNING clause.
   * @param {Array} queryConfig.values - The values to use in the parameterized
   *  query.
   * @param {String} notFoundMessage - Error message to use in the
   *  NotFoundError.
   * @returns {Object} An instance of the subclass, containing the new entry's
   *  data.
   */
  static async add(props, queryConfig, notFoundMessage) {
    const logPrefix = `${this.name}.add(${JSON.stringify(props)})`;
    logger.verbose(logPrefix);

    const result = await db.query({
      queryConfig,
      logPrefix,
      errorCallback: (err) => {
        // PostgreSQL error code 23503 is for foreign key violation.
        if (err.code === '23503') {
          // Logging not needed as it's already done in PostgresDb.query.
          throw new NotFoundError(notFoundMessage);
        }
      },
    });

    return new this(...Object.values(result.rows[0]));
  }

  /**
   * Retrieves all table entries in a relationship table, belonging to a
   * document.
   *
   * @param {Number} documentId - ID of the document to get the table entries
   *  for.
   * @param {Object} queryConfig - Configuration for the database query.
   * @param {String} queryConfig.text - SQL SELECT statement for the
   *  parameterized query.
   * @param {Array} queryConfig.values - The values to use in the parameterized
   *  query.
   * @returns {Array} A list of instances of the relationship data model.
   */
  static async getAll(documentId, queryConfig) {
    const logPrefix = `${this.name}.getAll(${documentId})`;
    logger.verbose(logPrefix);

    const result = await db.query({ queryConfig, logPrefix });

    return result.rows.map((data) => new this(...Object.values(data)));
  }

  /**
   * Retrieves a specific table entry by ID.
   *
   * @param {Object} queryParams - Contains the query parameters for finding a
   *  specific table entry.
   * @param {Object} queryConfig - Configuration for the database query.
   * @param {String} queryConfig.text - SQL SELECT statement for the
   *  parameterized query.
   * @param {Array} queryConfig.values - The values to use in the parameterized
   *  query.
   * @param {String} notFoundMessage - Error message to use in the
   *  NotFoundError.
   * @returns {Object} An instance of the subclass, containing the new entry's
   *  data.
   */
  static async get(queryParams, queryConfig, notFoundMessage) {
    const logPrefix = `${this.name}.get(${JSON.stringify(queryParams)})`;
    logger.verbose(logPrefix);

    const result = await db.query({ queryConfig, logPrefix });

    if (result.rows.length === 0) {
      logger.error(`${logPrefix}: ${this.name} not found.`);
      throw new NotFoundError(notFoundMessage);
    }

    const data = result.rows[0];
    return new this(...Object.values(data));
  }

  /**
   * Updates a table entry with a new position.  Throws a BadRequestError if
   * position is invalid.
   *
   * @param {Number} position - New position for this table entry.
   * @param {Object} queryConfig - Configuration for the database query.
   * @param {String} queryConfig.text - SQL UPDATE statement for the
   *  parameterized query, along with a RETURNING clause.
   * @param {Array} queryConfig.values - The values to use in the parameterized
   *  query.
   * @param {String} instanceArgsForLog - The ID names and values in the
   *  relationship instance, which will be used in the log for invalid position.
   * @param {String} notFoundLog - Log message for if the table entry is not in
   *  the database.
   * @param {String} serverErrorMessage - Error message to use in
   *  AppServerError, if the table entry is not in the database.
   * @returns {Object} The same instance that this method was called on, but
   *  with updated property values.
   */
  async update(
    position,
    queryConfig,
    instanceArgsForLog,
    notFoundLog,
    serverErrorMessage
  ) {
    const logPrefix = `${this.constructor.name}.update(${position})`;
    logger.verbose(logPrefix);

    if (position < 0) {
      const message = 'Position can not be less than 0.';
      logger.error(`${logPrefix}: ${instanceArgsForLog}: ${message}`);
      throw new BadRequestError(message);
    }

    const result = await db.query({ queryConfig, logPrefix });

    if (result.rowCount === 0) {
      logger.error(`${logPrefix}: ${notFoundLog}`);
      throw new AppServerError(serverErrorMessage);
    }

    // Update current instance's properties.
    Object.entries(result.rows[0]).forEach(([colName, val]) => {
      this[colName] = val;
    });

    return this;
  }

  /**
   * Deletes a table entry in the database.  Does not delete the instance
   * properties/fields.  Remember to delete the instance this belongs to!
   *
   * @param {Object} queryConfig - Configuration for the database query.
   * @param {String} queryConfig.text - SQL DELETE statement for the
   *  parameterized query.
   * @param {Array} queryConfig.values - The values to use in the parameterized
   *  query.
   * @param {String} deletedLog - Text to be appended after row count in the log
   *  message, describing what was deleted.  See code.
   */
  static async delete(queryConfig, deletedLog) {
    const logPrefix = `${this.constructor.name}.delete()`;
    logger.verbose(logPrefix);

    const result = await db.query({ queryConfig, logPrefix });

    if (result.rowCount) {
      logger.info(`${logPrefix}: ${result.rowCount} ${deletedLog}`);
    } else {
      logger.info(
        `${logPrefix}: 0 ${this.constructor.tableName} entries deleted.`
      );
    }
  }
}

// ==================================================

module.exports = Relationship;
