'use strict';

const { db } = require('../app');
const { AppServerError } = require('../errors/appErrors');
const { NotFoundError } = require('../errors/appErrors');
const { convertPropsForSqlUpdate } = require('../util/sqlHelpers');
const logger = require('../util/logger');

// ==================================================

/**
 * Represents a document.  This contains info about a document and not the
 * actual content.
 */
class Document {
  // To use in SQL statements to return all column data.
  static _allDbDocumentColsAsJs = `
    id,
    document_name AS "documentName",
    owner,
    created_on AS "createdOn",
    last_updated AS "lastUpdated",
    is_master AS "isMaster",
    is_template AS "isTemplate",
    is_locked AS "isLocked"`;

  constructor(
    id,
    documentName,
    owner,
    createdOn,
    lastUpdated,
    isMaster,
    isTemplate,
    isLocked
  ) {
    this.id = id;
    this.documentName = documentName;
    this.owner = owner;
    this.createdOn = createdOn;
    this.lastUpdated = lastUpdated;
    this.isMaster = isMaster;
    this.isTemplate = isTemplate;
    this.isLocked = isLocked;
  }

  /**
   * Creates a new document entry in the database.
   *
   * @param {Object} docProps - Contains data for creating a new document.
   * @param {String} docProps.documentName - Name of the document.
   * @param {String} docProps.owner - Username that the document belongs to.
   * @param {Boolean} docProps.isMaster - If the document is the master
   *  resume.
   * @param {Boolean} docProps.isTemplate - If the document is a template.
   * @returns {Document} A new Document instance that contains the document's
   *  data.
   */
  static async add(docProps) {
    const logPrefix = `Document.add(${JSON.stringify(docProps)})`;
    logger.verbose(logPrefix);

    const { documentName, owner, isMaster, isTemplate } = docProps;

    const queryConfig = {
      text: `
  INSERT INTO documents (document_name, owner, is_master, is_template)
  VALUES ($1, $2, $3, $4)
  RETURNING ${Document._allDbDocumentColsAsJs};`,
      values: [documentName, owner, isMaster, isTemplate],
    };

    const result = await db.query(queryConfig, logPrefix);

    return new Document(...Object.values(result.rows[0]));
  }

  /**
   * Retrieves all the documents belonging to a user.
   *
   * @param {String} owner - Username to get the documents for.
   * @returns {Document[]} A list of Document instances.
   */
  static async getAll(owner) {
    const logPrefix = `Document.getAll(${owner})`;
    logger.verbose(logPrefix);

    const queryConfig = {
      text: `
  SELECT ${Document._allDbDocumentColsAsJs}
  FROM documents
  WHERE owner = $1;`,
      values: [owner],
    };

    const result = await db.query(queryConfig, logPrefix);

    return result.rows.map((data) => new Document(...Object.values(data)));
  }

  /**
   * Retrieves a specific document by ID or name, for a specified owner.
   *
   * @param {Object} queryParams - Contains the query parameters for finding a
   *  specific document.
   * @param {String} [queryParams.id] - ID of the document.
   * @param {String} [queryParams.documentName] - Name of the document.
   * @param {String} queryParams.owner - Username the document belongs to.
   * @returns {Document} A new Document instance that contains the document's
   *  data.
   */
  static async get(queryParams) {
    const logPrefix = `Document.get(${JSON.stringify(queryParams)})`;
    logger.verbose(logPrefix);

    const { id, documentName, owner } = queryParams;

    const queryConfig = {
      text: `
  SELECT ${Document._allDbDocumentColsAsJs}
  FROM documents
  WHERE ${id == undefined ? 'document_name' : 'id'} = $1 AND owner = $2;`,
      values: [id == undefined ? documentName : id, owner],
    };

    const result = await db.query(queryConfig, logPrefix);

    if (result.rows.length === 0) {
      logger.error(`${logPrefix}: Document not found.`);
      throw new NotFoundError(`Can not find document "${documentName}".`);
    }

    const data = result.rows[0];
    return new Document(...Object.values(data));
  }

  /**
   * Updates a document with new properties.  If no properties are passed, then
   * the document is not updated.
   *
   * @param {Object} docProps - Contains the updated properties.
   * @param {String} [docProps.documentName] - The new name of the document.
   * @param {Boolean} [docProps.isMaster] - The new value for whether this
   *  document is the master resume.
   * @param {Boolean} [docProps.isTemplate] - The new value for whether this
   *  document is a template.
   * @param {Boolean} [docProps.isLocked] - The new value for whether this
   *  document is locked.
   * @returns {Document} The same Document instance that this method was called
   *  on, but with updated property values.
   */
  async update(docProps) {
    const logPrefix = `Document.update(${JSON.stringify(docProps)})`;
    logger.verbose(logPrefix);

    const allowedProps = ['documentName', 'isMaster', 'isTemplate', 'isLocked'];
    const filteredProps = Object.fromEntries(
      Object.entries(docProps).filter((prop) => allowedProps.includes(prop[0]))
    );

    if (!Object.keys(filteredProps).length) return this;

    const [sqlSubstring, sqlValues] = convertPropsForSqlUpdate(filteredProps);

    const queryConfig = {
      text: `
  UPDATE documents
  SET ${sqlSubstring}
    last_updated = (NOW() at time zone 'utc')
  WHERE id = $${sqlValues.length + 1}
  RETURNING ${Document._allDbDocumentColsAsJs};`,
      values: [...sqlValues, this.id],
    };

    const result = await db.query(queryConfig, logPrefix);

    if (result.rowCount === 0) {
      logger.error(
        `${logPrefix}: Document ID ${this.id} with ` +
          `name "${this.documentName}" was not found.`
      );
      throw new AppServerError(
        `Document ID ${this.id} with ` +
          `name "${this.documentName}" was not found.`
      );
    }

    Object.entries(result.rows[0]).forEach(([colName, val]) => {
      this[colName] = val;
    });

    return this;
  }

  /**
   * Deletes a document entry in the database.  Does not delete the instance
   * properties/fields.  Remember to delete the instance this belongs to!
   */
  async delete() {
    const logPrefix = `Document.delete()`;
    logger.verbose(logPrefix);

    const queryConfig = {
      text: `
      DELETE FROM documents
      WHERE id = $1;`,
      values: [this.id],
    };

    const result = await db.query(queryConfig, logPrefix);

    logger.info(`${logPrefix}: ${result.rowCount} document(s) deleted.`);
  }
}

// ==================================================

module.exports = Document;
