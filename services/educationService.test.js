'use strict';

const Education = require('../models/education');
const Document_X_Education = require('../models/document_x_education');
const { createEducation } = require('./educationService');
const {
  validateDocumentOwner: mockValidateDocumentOwner,
  getLastPosition: mockGetLastPosition,
} = require('../util/serviceHelpers');

const { ForbiddenError } = require('../errors/appErrors');

// ==================================================

jest.mock('../util/serviceHelpers');
jest.mock('../models/document_x_education');
jest.mock('../models/education');

// ==================================================

const username = 'user1';
const documentId = 1;

// --------------------------------------------------
// createEducation

describe('createEducation', () => {
  const mockProps = Object.freeze({ school: 'University' });
  const mockDocument = { isMaster: true };
  const mockEducation = Object.freeze({ id: 123 });
  const mockDocuments_x_educations = Object.freeze({});
  const lastPosition = 9;
  const mockDocument_x_education = Object.freeze({});

  beforeEach(() => {
    mockValidateDocumentOwner.mockReset();
    Education.add.mockReset();
    Document_X_Education.getAll.mockReset();
    mockGetLastPosition.mockReset();
    Document_X_Education.add.mockReset();
  });

  test(
    'Creates a new education and positions it in a document, ' +
      'if document belongs to user.',
    async () => {
      // Arrange
      mockValidateDocumentOwner.mockResolvedValue(mockDocument);
      Education.add.mockResolvedValue(mockEducation);
      Document_X_Education.getAll.mockResolvedValue(mockDocuments_x_educations);
      mockGetLastPosition.mockReturnValue(lastPosition);
      Document_X_Education.add.mockResolvedValue(mockDocument_x_education);

      // Act
      const { education, document_x_education } = await createEducation(
        username,
        documentId,
        mockProps
      );

      // Assert
      expect(education).toEqual(mockEducation);
      expect(document_x_education).toEqual(mockDocument_x_education);

      expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
        username,
        documentId,
        expect.any(String)
      );

      expect(Education.add).toHaveBeenCalledWith({
        ...mockProps,
        owner: username,
      });

      expect(Document_X_Education.getAll).toHaveBeenCalledWith(documentId);

      expect(mockGetLastPosition).toHaveBeenCalledWith(
        mockDocuments_x_educations
      );

      expect(Document_X_Education.add).toHaveBeenCalledWith({
        documentId,
        educationId: mockEducation.id,
        position: lastPosition + 1,
      });
    }
  );

  test('The position of the new education is after the last (highest) one.', async () => {
    // Arrange
    mockValidateDocumentOwner.mockResolvedValue(mockDocument);
    Education.add.mockResolvedValue(mockEducation);
    Document_X_Education.getAll.mockResolvedValue(mockDocuments_x_educations);
    mockGetLastPosition.mockReturnValue(lastPosition);
    Document_X_Education.add.mockResolvedValue(mockDocument_x_education);

    // Act
    await createEducation(username, documentId, mockProps);

    // Assert
    expect(Document_X_Education.add).toHaveBeenCalledWith(
      expect.objectContaining({ position: lastPosition + 1 })
    );
  });

  test(
    'The position of the new education is 0 if there are no existing ' +
      'educations in the document.',
    async () => {
      // Arrange
      const lastPosition = -1;

      mockValidateDocumentOwner.mockResolvedValue(mockDocument);
      Education.add.mockResolvedValue(mockEducation);
      Document_X_Education.getAll.mockResolvedValue(mockDocuments_x_educations);
      mockGetLastPosition.mockReturnValue(lastPosition);
      Document_X_Education.add.mockResolvedValue(mockDocument_x_education);

      // Act
      await createEducation(username, documentId, mockProps);

      // Assert
      expect(Document_X_Education.add).toHaveBeenCalledWith(
        expect.objectContaining({ position: lastPosition + 1 })
      );
    }
  );

  test('Throws an Error if document is not the master resume.', async () => {
    // Arrange
    const mockDocument = { isMaster: false };

    mockValidateDocumentOwner.mockResolvedValue(mockDocument);

    // Act
    async function runFunc() {
      await createEducation(username, documentId, mockProps);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);
    expect(Education.add).not.toHaveBeenCalled();
    expect(Document_X_Education.getAll).not.toHaveBeenCalled();
    expect(mockGetLastPosition).not.toHaveBeenCalled();
    expect(Document_X_Education.add).not.toHaveBeenCalled();
  });
});
