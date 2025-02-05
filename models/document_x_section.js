'use strict';

const { db } = require('../app');
const {
  AppServerError,
  BadRequestError,
  NotFoundError,
} = require('../errors/appErrors');
const logger = require('../util/logger');

// ==================================================

/**
 * Represents a document and section relationship.
 */
class Document_X_Section {
  // To use in SQL statements to return all column data.  Ensure the properties
  // are in the same order and amount as constructor parameters.
  static _allDbColsAsJs = `
    document_id AS "documentId",
    section_id AS "sectionId",
    position`;

  constructor(documentId, sectionId, position) {
    this.documentId = documentId;
    this.sectionId = sectionId;
    this.position = position;
  }

  /**
   * Creates a new document_x_section entry in the database.
   *
   * @param {Object} props - Contains data for creating a new
   *  document_x_section.
   * @param {String} props.documentId - ID of the document.
   * @param {String} props.sectionId - ID of the section.
   * @param {Number} props.position - Position of section among other sections
   *  in the document.
   * @returns {Document_X_Section} A new Document_X_Section instance that
   *  contains the document_x_section's data.
   */
  static async add(props) {
    const logPrefix = `Document_X_Section.add(${JSON.stringify(props)})`;
    logger.verbose(logPrefix);

    // Allowed properties/attributes.
    const { documentId, sectionId, position } = props;

    const queryConfig = {
      text: `
  INSERT INTO documents_x_sections (
    document_id,
    section_id,
    position
  )
  VALUES ($1, $2, $3)
  RETURNING ${Document_X_Section._allDbColsAsJs};`,
      values: [documentId, sectionId, position],
    };

    const result = await db.query(queryConfig, logPrefix, (err) => {
      // PostgreSQL error code 23503 is for foreign key violation.
      if (err.code === '23503') {
        throw new NotFoundError(
          'Document or section was not found.  ' +
            `Document ID: ${documentId}, ` +
            `section ID: ${sectionId}.`
        );
      }
    });

    return new Document_X_Section(...Object.values(result.rows[0]));
  }

  /**
   * Retrieves all the documents_x_sections belonging to a document.
   *
   * @param {Number} documentId - ID of the document to get the
   *  documents_x_sections for.
   * @returns {Document_X_Section[]} A list of Document_X_Section instances.
   */
  static async getAll(documentId) {
    const logPrefix = `Document_X_Section.getAll(${documentId})`;
    logger.verbose(logPrefix);

    const queryConfig = {
      text: `
  SELECT ${Document_X_Section._allDbColsAsJs}
  FROM documents_x_sections
  WHERE document_id = $1;`,
      values: [documentId],
    };

    const result = await db.query(queryConfig, logPrefix);

    return result.rows.map(
      (data) => new Document_X_Section(...Object.values(data))
    );
  }

  /**
   * Retrieves a specific document_x_section by ID.
   *
   * @param {Object} queryParams - Contains the query parameters for finding a
   *  specific document_x_section.
   * @param {Number} [queryParams.documentId] - Document ID of the
   *  document_x_section.
   * @param {String} [queryParams.sectionId] - Section ID of the
   *  document_x_section.
   * @returns {Document_X_Section} A new Document_X_Section instance that
   *  contains the document_x_section's data.
   */
  static async get(queryParams) {
    const logPrefix = `Document_X_Section.get(${JSON.stringify(queryParams)})`;
    logger.verbose(logPrefix);

    // Allowed parameters.
    const { documentId, sectionId } = queryParams;

    const queryConfig = {
      text: `
  SELECT ${Document_X_Section._allDbColsAsJs}
  FROM documents_x_sections
  WHERE document_id = $1 AND section_id = $2;`,
      values: [documentId, sectionId],
    };

    const result = await db.query(queryConfig, logPrefix);

    if (result.rows.length === 0) {
      logger.error(`${logPrefix}: Document_X_Section not found.`);
      throw new NotFoundError(
        'Can not find document-section relation with ' +
          `document ID ${documentId} and section ID ${sectionId}.`
      );
    }

    const data = result.rows[0];
    return new Document_X_Section(...Object.values(data));
  }

  /**
   * Updates a document_x_section with a new position.  Throws a BadRequestError
   * if position is invalid.
   *
   * @param {Number} position - New position for this document_x_section.
   * @returns {Document_X_Section} The same Document_X_Section instance that
   *  this method was called on, but with updated property values.
   */
  async update(position) {
    const logPrefix = `Document_X_Section.update(${position})`;
    logger.verbose(logPrefix);

    if (position < 0) {
      const message = 'Position can not be less than 0.';
      logger.error(
        `${logPrefix}: documentId = ${this.documentId}, ` +
          `sectionId = ${this.sectionId}: ${message}`
      );
      throw new BadRequestError(message);
    }

    const queryConfig = {
      text: `
  UPDATE documents_x_sections
  SET position = $1
  WHERE document_id = $2 AND section_id = $3
  RETURNING ${Document_X_Section._allDbColsAsJs};`,
      values: [position, this.documentId, this.sectionId],
    };

    const result = await db.query(queryConfig, logPrefix);

    if (result.rowCount === 0) {
      logger.error(
        `${logPrefix}: Document_X_Section with ` +
          `document ID ${this.documentId} and ` +
          `section ID ${this.sectionId} was not found.`
      );
      throw new AppServerError(
        `Document-section relation with document ID ${this.documentId} and ` +
          `section ID ${this.sectionId} was not found.`
      );
    }

    // Update current instance's properties.
    Object.entries(result.rows[0]).forEach(([colName, val]) => {
      this[colName] = val;
    });

    return this;
  }

  /**
   * Deletes a document_x_section entry in the database.  Does not delete the
   * instance properties/fields.  Remember to delete the instance this belongs
   * to!
   */
  async delete() {
    const logPrefix = 'Document_X_Section.delete()';
    logger.verbose(logPrefix);

    const queryConfig = {
      text: `
  DELETE FROM documents_x_sections
  WHERE document_id = $1 AND section_id = $2;`,
      values: [this.documentId, this.sectionId],
    };

    const result = await db.query(queryConfig, logPrefix);

    if (result.rowCount) {
      logger.info(
        `${logPrefix}: ${result.rowCount} document_x_section(s) deleted: ` +
          `documentId = ${this.documentId}, sectionId = ${this.sectionId}.`
      );
    } else {
      logger.info(`${logPrefix}: 0 documents_x_sections entries deleted.`);
    }
  }
}

// ==================================================

module.exports = Document_X_Section;
