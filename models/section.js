'use strict';

const { db } = require('../app');
const logger = require('../util/logger');

// ==================================================

/**
 * Represents a resume section.  Examples are education, skills, and work
 * experience.
 */
class Section {
  // To use in SQL statements to return all column data.  Ensure the properties
  // are in the same order and amount as constructor parameters.
  static _allDbColsAsJs = `
    id,
    section_name AS "sectionName"`;

  constructor(id, sectionName) {
    this.id = id;
    this.sectionName = sectionName;
  }

  /**
   * Creates a new section entry in the database.
   *
   * @param {Object} sectionProps - Contains data for creating a new section.
   * @param {String} sectionProps.sectionName - Name of the section.
   * @returns {Section} A new Section instance that contains the section's
   *  data.
   */
  static async add(sectionProps) {
    const logPrefix = `Section.add(${JSON.stringify(sectionProps)})`;
    logger.verbose(logPrefix);

    // Allowed properties/attributes.
    const { sectionName } = sectionProps;

    const queryConfig = {
      text: `
  INSERT INTO sections (section_name)
  VALUES ($1)
  RETURNING ${Section._allDbColsAsJs};`,
      values: [sectionName],
    };

    const result = await db.query(queryConfig, logPrefix);

    return new Section(...Object.values(result.rows[0]));
  }
}

// ==================================================

module.exports = Section;
