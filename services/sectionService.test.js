'use strict';

const Document_X_Section = require('../models/document_x_section');
const { createDocument_x_section } = require('./sectionService');
const {
  validateDocumentOwner: mockValidateDocumentOwner,
} = require('../util/serviceHelpers');

// ==================================================

jest.mock('../util/serviceHelpers');
jest.mock('../models/document_x_section');

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
