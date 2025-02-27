'use strict';

const Section = require('../models/section');
const Document_X_Section = require('../models/document_x_section');
const {
  createDocument_x_section,
  updateDocument_x_sectionPositions,
} = require('./sectionService');
const {
  validateDocumentOwner: mockValidateDocumentOwner,
} = require('../util/serviceHelpers');

const { BadRequestError } = require('../errors/appErrors');

// ==================================================

jest.mock('../util/serviceHelpers');
jest.mock('../models/document_x_section');
jest.mock('../models/section');

// ==================================================

// --------------------------------------------------
// createDocument_x_section

describe('createDocument_x_section', () => {
  const username = 'user1';
  const documentId = 1;

  beforeEach(() => {
    mockValidateDocumentOwner.mockReset();
    Document_X_Section.getAll.mockReset();
    Document_X_Section.add.mockReset();
  });

  test.each([
    [[], 0],
    [
      [
        { documentId, sectionId: 1, position: 0 },
        { documentId, sectionId: 2, position: 1 },
      ],
      2,
    ],
  ])(
    'Calls Document_X_Section.add if document is found and belongs to user.  ' +
      'Existing documents_x_sections = %j.',
    async (existingDocuments_x_sections, expectedNewPosition) => {
      // Arrange
      const sectionIdToAdd = 3;

      const mockObject = Object.freeze({});
      Document_X_Section.getAll.mockResolvedValue(existingDocuments_x_sections);
      Document_X_Section.add.mockResolvedValue(mockObject);

      // Act
      const document_x_section = await createDocument_x_section(
        username,
        documentId,
        sectionIdToAdd
      );

      // Assert
      expect(document_x_section).toBe(mockObject);

      expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
        username,
        documentId,
        expect.any(String)
      );

      expect(Document_X_Section.getAll).toHaveBeenCalledWith(documentId);

      expect(Document_X_Section.add).toHaveBeenCalledWith({
        documentId,
        sectionId: sectionIdToAdd,
        position: expectedNewPosition,
      });
    }
  );

  test("The new document_x_section's position is correct.", async () => {
    // Arrange
    const sectionIdToAdd = 3;
    const existingDocuments_x_sections = [
      { documentId, sectionId: 1, position: 2 },
      { documentId, sectionId: 2, position: 6 },
    ];

    const mockObject = Object.freeze({});
    Document_X_Section.getAll.mockResolvedValue(existingDocuments_x_sections);
    Document_X_Section.add.mockResolvedValue(mockObject);

    // Act
    const document_x_section = await createDocument_x_section(
      username,
      documentId,
      sectionIdToAdd
    );

    // Assert
    expect(document_x_section).toBe(mockObject);
    expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
      username,
      documentId,
      expect.any(String)
    );
    expect(Document_X_Section.getAll).toHaveBeenCalledWith(documentId);
    expect(Document_X_Section.add).toHaveBeenCalledWith({
      documentId,
      sectionId: sectionIdToAdd,
      position: 7,
    });
  });
});

// --------------------------------------------------
// updateDocument_x_sectionPositions

describe('updateDocument_x_sectionPositions', () => {
  const username = 'user1';
  const documentId = 1;

  const existingDocuments_x_sections = Object.freeze([
    Object.freeze({ documentId, sectionId: 1, position: 2 }),
    Object.freeze({ documentId, sectionId: 2, position: 6 }),
  ]);

  beforeEach(() => {
    mockValidateDocumentOwner.mockReset();
    Document_X_Section.getAll.mockReset();
    Document_X_Section.updateAllPositions.mockReset();
    Section.getAllInDocument.mockReset();
  });

  test(
    'Does not throw an Error if given exactly the section IDs ' +
      'in the document.',
    async () => {
      // Arrange
      const sectionIds = Object.freeze([2, 1]);

      const mockArray = Object.freeze([]);
      Document_X_Section.getAll.mockResolvedValue(existingDocuments_x_sections);
      Section.getAllInDocument.mockResolvedValue(mockArray);

      // Act
      const documents_x_sections = await updateDocument_x_sectionPositions(
        username,
        documentId,
        sectionIds
      );

      // Assert
      expect(documents_x_sections).toBe(mockArray);
      expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
        username,
        documentId,
        expect.any(String)
      );
      expect(Document_X_Section.getAll).toHaveBeenCalledWith(documentId);
      expect(Document_X_Section.updateAllPositions).toHaveBeenCalledWith(
        documentId,
        sectionIds
      );
      expect(Section.getAllInDocument).toHaveBeenCalledWith(documentId);
    }
  );

  test.each([[[1]], [[1, 2, 3]], [[3, 2, 1]], [[5, 8]]])(
    'Throws an Error if section IDs are not exactly the ones and ' +
      'amount in the document.  sectionIds = %j.',
    async (sectionIds) => {
      // Arrange
      const mockArray = Object.freeze([]);
      Document_X_Section.getAll.mockResolvedValue(existingDocuments_x_sections);
      Section.getAllInDocument.mockResolvedValue(mockArray);

      // Act
      async function runFunc() {
        await updateDocument_x_sectionPositions(
          username,
          documentId,
          sectionIds
        );
      }

      // Assert
      await expect(runFunc).rejects.toThrow(BadRequestError);
      expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
        username,
        documentId,
        expect.any(String)
      );
      expect(Document_X_Section.updateAllPositions).not.toHaveBeenCalled();
      expect(Section.getAllInDocument).not.toHaveBeenCalled();
    }
  );
});
