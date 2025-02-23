'use strict';

const Section = require('./section');

const db = require('../database/db');
const Document = require('./document');
const Document_X_Section = require('./document_x_section');
const User = require('./user');

const { users, sections: sectionsInputData } = require('../_testData');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
} = require('../_testCommon');

// ==================================================
// Specific Tests

describe('Section', () => {
  beforeAll(() =>
    commonBeforeAll(db).then(() =>
      db.query({
        text: `
  INSERT INTO ${User.tableName}
  VALUES ($1, $2);`,
        values: [users[0].username, users[0].password],
      })
    )
  );

  afterAll(() => commonAfterAll(db));

  // --------------------------------------------------
  // getAllInDocument

  describe('getAllInDocument', () => {
    let documentId;
    const sections = [];

    const newsSectionsInputData = [
      ...sectionsInputData,
      { sectionName: 'section extra' },
    ];

    beforeAll(async () => {
      await commonBeforeEach(db, Document.tableName);

      const document = await Document.add({
        documentName: 'Master',
        owner: users[0].username,
        isMaster: true,
        isTemplate: false,
      });

      documentId = document.id;

      for (const section of newsSectionsInputData) {
        sections.push(await Section.add({ sectionName: section.sectionName }));
      }
    });

    beforeEach(() => commonBeforeEach(db, Document_X_Section.tableName));

    afterAll(() => commonBeforeEach(db, Document.tableName));

    // 0, many
    test.each([[[]], [sections]])(
      'Gets all sections of a document in the correct order.',
      async (sectionsToAttach) => {
        // Arrange
        for (let i = 0; i < sectionsToAttach.length; i++) {
          await Document_X_Section.add({
            documentId,
            sectionId: sectionsToAttach[i].id,
            position: sectionsToAttach.length - i - 1, // reverse order
          });
        }

        // Act
        const retrievedSections = await Section.getAllInDocument(documentId);

        // Assert
        expect(retrievedSections).toEqual(sectionsToAttach.toReversed());
      }
    );

    test('Returns an empty list if document ID does not exist.', async () => {
      // Arrange
      const nonexistentDocumentId = 99;

      for (let i = 0; i < sections.length; i++) {
        await Document_X_Section.add({
          documentId,
          sectionId: sections[i].id,
          position: sections.length - i - 1, // reverse order
        });
      }

      // Act
      const retrievedSections = await Section.getAllInDocument(
        nonexistentDocumentId
      );

      // Assert
      expect(retrievedSections).toEqual([]);
    });
  });
});
