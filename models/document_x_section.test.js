'use strict';

const db = require('../database/db');
const Document_X_Section = require('./document_x_section');

const {
  AppServerError,
  NotFoundError,
  BadRequestError,
} = require('../errors/appErrors');

const Document = require('./document');
const Section = require('./section');
const User = require('./user');
const {
  users,
  documents,
  sections,
  documents_x_sections,
} = require('../_testData');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
} = require('../_testCommon');

// ==================================================

describe('Document_X_Section', () => {
  // To help with expects by directly getting data from the database.
  const sqlTextSelectAll = `
  SELECT ${Document_X_Section._allDbColsAsJs}
  FROM ${Document_X_Section.tableName}`;

  const documentId = 1;

  beforeAll(() =>
    commonBeforeAll(db)
      .then(() =>
        db.query({
          text: `
  INSERT INTO ${User.tableName}
  VALUES ($1, $2);`,
          values: [users[0].username, users[0].password],
        })
      )
      .then(() =>
        db.query({
          text: `
  INSERT INTO ${Document.tableName} (
    id,
    document_name,
    owner,
    is_master,
    is_template
  ) VALUES ($1, $2, $3, $4, $5);`,
          values: [
            documentId,
            documents[0].documentName,
            documents[0].owner,
            documents[0].isMaster,
            documents[0].isTemplate,
          ],
        })
      )
      .then(() => {
        const sqlValuesText = sections
          .map(
            (sectionData, idx) =>
              `\n    (${idx + 1}, '${sectionData.sectionName}')`
          )
          .join();

        db.query({
          text: `
  INSERT INTO ${Section.tableName}
  VALUES ${sqlValuesText};`,
        });
      })
  );

  beforeEach(() => commonBeforeEach(db, Document_X_Section.tableName));

  afterAll(() => commonAfterAll(db));

  // -------------------------------------------------- add

  describe('add', () => {
    const dataToAdd = documents_x_sections[0];

    test('Adds a new document_x_section.', async () => {
      // Act
      const instance = await Document_X_Section.add(dataToAdd);

      // Assert
      expect(instance).toBeInstanceOf(Document_X_Section);
      expect(instance).toEqual(dataToAdd);

      const databaseEntry = (
        await db.query({
          text:
            sqlTextSelectAll +
            '\n  WHERE document_id = $1 AND section_id = $2;',
          values: [dataToAdd.documentId, dataToAdd.sectionId],
        })
      ).rows[0];

      expect(databaseEntry).toEqual(dataToAdd);
    });

    test.each([
      ['document', { documentId: 999 }],
      ['section', { sectionId: 999 }],
    ])(
      'Throws an Error if %s does not exist.',
      async (propertyName, nonexistentData) => {
        // Arrange
        const nonexistentRefData = {
          ...dataToAdd,
          ...nonexistentData,
        };

        // Act
        async function runFunc() {
          await Document_X_Section.add(nonexistentRefData);
        }

        // Assert
        await expect(runFunc).rejects.toThrow(NotFoundError);

        const databaseEntries = (
          await db.query({
            text: sqlTextSelectAll + '\n  WHERE document_id = $1;',
            values: [documentId],
          })
        ).rows;

        // Ensure nothing gets added into database.
        expect(databaseEntries.length).toBe(0);
      }
    );

    test(
      'Throws an Error if adding a document_x_section ' +
        'with same position as another.',
      async () => {
        // Arrange
        const dataWithSamePosition = {
          ...dataToAdd,
          sectionId: documents_x_sections[1].sectionId,
        };

        await Document_X_Section.add(dataToAdd);

        // Act
        async function runFunc() {
          await Document_X_Section.add(dataWithSamePosition);
        }

        // Assert
        await expect(runFunc).rejects.toThrow();

        const databaseEntries = (
          await db.query({
            text: sqlTextSelectAll + '\n  WHERE document_id = $1;',
            values: [documentId],
          })
        ).rows;

        // Ensure existing data has not been modified.
        expect(databaseEntries.length).toBe(1);
        expect(databaseEntries[0]).toEqual(dataToAdd);
      }
    );
  });

  // -------------------------------------------------- getAll

  describe('getAll', () => {
    test.each([
      [0, [], []],
      [documents_x_sections.length, documents_x_sections, documents_x_sections],
    ])(
      'Get all of %i document_x_section(s) for a document.',
      async (amount, inputData, expected) => {
        // Arrange
        for (const props of inputData) {
          await Document_X_Section.add(props);
        }

        // Act
        const instances = await Document_X_Section.getAll(documentId);

        // Assert
        expect(instances.length).toBe(inputData.length);

        instances.forEach((instance, i) => {
          expect(instance).toBeInstanceOf(Document_X_Section);
          expect(instance).toEqual(expected[i]);
        });
      }
    );

    test('Get all documents_x_sections in the correct order.', async () => {
      const len = documents_x_sections.length;
      expect(len).toBeGreaterThanOrEqual(3);

      // Arrange
      // Change positions so that they are not sequential and are reversed.
      const modifiedDocuments_x_sections = Object.freeze(
        documents_x_sections.map((document_x_section, idx) => {
          return Object.freeze({
            ...document_x_section,
            position: len * (len - idx),
          });
        })
      );

      for (const props of modifiedDocuments_x_sections) {
        await Document_X_Section.add(props);
      }

      // Act
      const instances = await Document_X_Section.getAll(documentId);

      // Assert
      expect(instances).toEqual(modifiedDocuments_x_sections.toReversed());
    });
  });

  // -------------------------------------------------- get

  describe('get', () => {
    const existingData = documents_x_sections[0];

    test('Gets a specified document_x_section.', async () => {
      // Arrange
      await Document_X_Section.add(existingData);

      const queryParams = {
        documentId: existingData.documentId,
        sectionId: existingData.sectionId,
      };

      // Act
      const instance = await Document_X_Section.get(queryParams);

      // Assert
      expect(instance).toBeInstanceOf(Document_X_Section);
      expect(instance).toEqual(existingData);
    });

    test('Throws an Error if document_x_section is not found.', async () => {
      // Arrange
      const queryParams = { documentId: 999, sectionId: 999 };

      // Act
      async function runFunc() {
        await Document_X_Section.get(queryParams);
      }

      // Assert
      await expect(runFunc).rejects.toThrow(NotFoundError);
    });
  });

  // -------------------------------------------------- update

  describe('update', () => {
    // Arrange
    const existingData = documents_x_sections[0];
    let preexistingInstance = null;

    beforeEach((done) => {
      Document_X_Section.add(existingData).then((instance) => {
        preexistingInstance = instance;
        done();
      });
    });

    afterEach(() => {
      preexistingInstance = null;
    });

    test('Updates a document_x_section.', async () => {
      // Arrange
      const newPosition = existingData.position + documents_x_sections.length;

      const expectedUpdatedData = {
        ...existingData,
        position: newPosition,
      };

      // Act
      const updatedInstance = await preexistingInstance.update(newPosition);

      // Assert
      expect(updatedInstance).toEqual(expectedUpdatedData);

      const databaseEntry = (
        await db.query({
          text:
            sqlTextSelectAll +
            '\n  WHERE document_id = $1 AND section_id = $2;',
          values: [
            preexistingInstance.documentId,
            preexistingInstance.sectionId,
          ],
        })
      ).rows[0];

      expect(databaseEntry).toEqual(expectedUpdatedData);
    });

    test('Throws an Error if position is invalid.', async () => {
      // Arrange
      const newPosition = -1;

      // Act
      async function runFunc() {
        await preexistingInstance.update(newPosition);
      }

      // Assert
      await expect(runFunc).rejects.toThrow(BadRequestError);
    });

    test('Throws an Error if document_x_section is not found.', async () => {
      // Arrange
      const nonexistentInstance = new Document_X_Section(999, 999);

      // Act
      async function runFunc() {
        await nonexistentInstance.update(9);
      }

      // Assert
      await expect(runFunc).rejects.toThrow(AppServerError);
    });
  });

  // -------------------------------------------------- delete

  describe('delete', () => {
    const existingData = documents_x_sections[0];

    test('Deletes a document_x_section.', async () => {
      // Arrange
      const instance = await Document_X_Section.add(existingData);

      // Act
      await instance.delete();

      // Assert
      const databaseData = await db.query({
        text:
          sqlTextSelectAll + '\n  WHERE document_id = $1 AND section_id = $2;',
        values: [instance.documentId, instance.sectionId],
      });

      expect(databaseData.rows.length).toBe(0);
    });

    test('Does not throw an Error if document_x_section is not found.', async () => {
      // Arrange
      const nonexistentInstance = new Document_X_Section(999, 999);

      // Act
      await nonexistentInstance.delete();
    });
  });
});
