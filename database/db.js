/** Database setup for app. */

'use strict';

const { Pool } = require('pg');

const { DATABASE_URI } = require('../config');
const logger = require('../util/logger');

// ==================================================

/**
 * The class that will handle making the database connection.  This also will
 * act as an adapter.
 */
class PostgresDb {
  static config = {
    connectionString: DATABASE_URI,
  };

  /**
   * Creates a new database connection pool.
   */
  constructor() {
    this.pool = new Pool(PostgresDb.config);
    this.pool.on('error', (err, client) => {
      logger.error('Unexpected error on idle client: ' + err);
      process.exit(-1);
    });
  }

  /**
   * Shuts down PostgreSQL connection pool, so that there are no active
   * connections.
   */
  async shutdown() {
    await this.pool.end();
  }

  /**
   * Acts as a liaison between the call to query the database and the app.
   * This is used to add things like logging to each query.
   *
   * @param {Object} queryConfig - Contains parameters such as text (SQL
   *  strings), values (arguments for parameterized queries), and name (for
   *  creating prepared statements).  See
   *  [https://node-postgres.com/apis/client#queryconfig].
   * @returns The result from a database query.
   */
  async query(queryConfig) {
    logger.info('Executing query on database: ' + queryConfig.text);
    const dbClient = await this.pool.connect();
    const result = await dbClient.query(queryConfig);
    dbClient.release();
    return result;
  }
}

// ==================================================

module.exports = PostgresDb;
