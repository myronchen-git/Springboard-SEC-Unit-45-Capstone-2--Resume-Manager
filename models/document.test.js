'use strict';

const Document = require('./document');
const { db } = require('../app');
const { AppServerError } = require('../errors/appErrors');

// ==================================================

// Mock to bypass executing app code, but use actual "db" instance.
jest.mock('../app', () => ({
  db: new (require('../database/db'))(),
}));

// ==================================================

describe('Document', () => {
  const existingUser = Object.freeze({ username: 'user1', password: '123' });

  const newDocsProps = Object.freeze([
    Object.freeze({
      documentName: 'doc1',
      owner: existingUser.username,
      isMaster: true,
      isTemplate: false,
    }),
    Object.freeze({
      documentName: 'doc2',
      owner: existingUser.username,
      isMaster: false,
      isTemplate: true,
    }),
  ]);

  function getExpectedDocData(docProps) {
    return {
      id: expect.any(Number),
      documentName: docProps.documentName,
      owner: docProps.owner,
      createdOn: expect.any(Date),
      lastUpdated: null,
      isMaster: docProps.isMaster,
      isTemplate: docProps.isTemplate,
      isLocked: false,
    };
  }

  // To help with expects by directly getting data from the database.
  const sqlTextGetAll = `
  SELECT
    id,
    document_name AS "documentName",
    owner,
    created_on AS "createdOn",
    last_updated AS "lastUpdated",
    is_master AS "isMaster",
    is_template AS "isTemplate",
    is_locked AS "isLocked"
  FROM documents`;

  beforeAll(() => {
    return db.query({
      text: `
    INSERT INTO users VALUES
    ($1, $2);`,
      values: [existingUser.username, existingUser.password],
    });
  });

  beforeEach(() => {
    return db.query({ text: 'TRUNCATE TABLE documents CASCADE;' });
  });

  afterAll((done) => {
    db.query({ text: 'TRUNCATE TABLE users CASCADE;' })
      .then(() => db.shutdown())
      .then(() => done());
  });

  // -------------------------------------------------- add

  describe('add', () => {
    // Arrange
    const docProps = newDocsProps[0];
    const expectedDocData = getExpectedDocData(docProps);

    test('Adds a new document.', async () => {
      // Act
      const document = await Document.add(docProps);

      // Assert
      expect(document).toBeInstanceOf(Document);
      expect(document).toEqual(expectedDocData);

      const databaseDocData = (
        await db.query({
          text: sqlTextGetAll + '\n  WHERE id = $1;',
          values: [document.id],
        })
      ).rows[0];

      expect(databaseDocData).toEqual(expectedDocData);
    });

    test('Throws an Error if adding a document with the same name as another.', async () => {
      // Arrange
      await Document.add(docProps);
      const duplicateDocProps = { ...docProps, isMaster: false };

      // Act
      async function runFunc() {
        await Document.add(duplicateDocProps);
      }

      // Assert
      await expect(runFunc).rejects.toThrow();

      const databaseDocsData = (
        await db.query({
          text: sqlTextGetAll + '\n  WHERE owner = $1;',
          values: [existingUser.username],
        })
      ).rows;

      // Ensure existing data has not been modified.
      expect(databaseDocsData.length).toBe(1);
      expect(databaseDocsData[0]).toEqual(expectedDocData);
    });
  });

  // -------------------------------------------------- getAll

  describe('getAll', () => {
    test.each([
      [2, newDocsProps],
      [0, []],
    ])('Get all of %i documents for a user.', async (amount, docsProps) => {
      // Arrange
      const expectedDocsData = [];

      for (const props of docsProps) {
        await Document.add(props);
        expectedDocsData.push(getExpectedDocData(props));
      }

      // Act
      const documents = await Document.getAll(existingUser.username);

      // Assert
      expect(documents.length).toBe(docsProps.length);

      documents.forEach((document, i) => {
        expect(document).toBeInstanceOf(Document);
        expect(document).toEqual(expectedDocsData[i]);
      });
    });
  });

  // -------------------------------------------------- get

  describe('get', () => {
    const docProps = newDocsProps[0];
    const expectedDocData = getExpectedDocData(docProps);

    test.each([
      ['ID', { owner: existingUser.username }],
      [
        'ID',
        { documentName: docProps.documentName, owner: existingUser.username },
      ],
      [
        'name',
        { documentName: docProps.documentName, owner: existingUser.username },
      ],
    ])(
      'Gets a specified document by %s from a user.',
      async (type, queryParams) => {
        // Arrange
        const existingDocument = await Document.add(docProps);

        if (type === 'ID') queryParams.id = existingDocument.id;

        // Act
        const document = await Document.get(queryParams);

        // Assert
        expect(document).toBeInstanceOf(Document);
        expect(document).toEqual(expectedDocData);
      }
    );
  });

  // -------------------------------------------------- update

  describe('update', () => {
    // Arrange
    const docProps = newDocsProps[0];
    let existingDocument = null;

    const updateProps = Object.freeze({
      documentName: 'New Name',
      isMaster: !docProps.isMaster,
      isTemplate: !docProps.isTemplate,
      isLocked: !docProps.isLocked,
    });

    beforeEach((done) => {
      Document.add(docProps).then((document) => {
        existingDocument = document;
        done();
      });
    });

    afterEach(() => {
      existingDocument = null;
    });

    test.each([
      [0, Object.freeze({})], // empty
      [1, Object.freeze({ documentName: updateProps.documentName })], // one
      [Object.keys(updateProps).length, updateProps], // all
      [
        Object.keys(updateProps).length + 1,
        Object.freeze({ ...updateProps, isValidColumn: false }),
      ], // extra
    ])('Updates a document with %s properties.', async (amount, props) => {
      // Arrange
      const expectedUpdatedDocument = {
        id: existingDocument.id,
        documentName: props.documentName || existingDocument.documentName,
        owner: existingDocument.owner,
        createdOn: existingDocument.createdOn,
        lastUpdated: Object.keys(props).length ? expect.any(Date) : null,
        isMaster:
          props.isMaster == undefined
            ? existingDocument.isMaster
            : props.isMaster,
        isTemplate:
          props.isTemplate == undefined
            ? existingDocument.isTemplate
            : props.isTemplate,
        isLocked:
          props.isLocked == undefined
            ? existingDocument.isLocked
            : props.isLocked,
      };

      // Act
      const updatedDocument = await existingDocument.update(props);

      // Assert
      expect(updatedDocument).toEqual(expectedUpdatedDocument);

      const databaseDocData = (
        await db.query({
          text: sqlTextGetAll + '\n  WHERE id = $1;',
          values: [existingDocument.id],
        })
      ).rows[0];

      expect(databaseDocData).toEqual(expectedUpdatedDocument);
    });

    test('Throws an Error if document is not found.', async () => {
      // Arrange
      const nonexistentDocument = new Document(999);

      // Act
      async function runFunc() {
        await nonexistentDocument.update(updateProps);
      }

      // Assert
      await expect(runFunc).rejects.toThrow(AppServerError);
    });
  });

  // -------------------------------------------------- delete

  describe('delete', () => {
    const docProps = newDocsProps[0];

    test('Deletes a document.', async () => {
      // Arrange
      const document = await Document.add(docProps);

      // Act
      await document.delete();

      // Assert
      const databaseDocsData = await db.query({
        text: 'SELECT id FROM documents WHERE id = $1;',
        values: [document.id],
      });

      expect(databaseDocsData.rows.length).toBe(0);
    });

    test('Does not throw an Error if document is not found.', async () => {
      // Arrange
      const nonexistentDocument = new Document(999);

      // Act
      await nonexistentDocument.delete();
    });
  });
});
