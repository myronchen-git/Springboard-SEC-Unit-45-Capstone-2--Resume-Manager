'use strict';

const Education = require('../models/education');
const Document_X_Education = require('../models/document_x_education');
const {
  createEducation,
  createDocument_x_education,
  updateEducation,
} = require('./educationService');
const {
  validateDocumentOwner: mockValidateDocumentOwner,
  getLastPosition: mockGetLastPosition,
} = require('../util/serviceHelpers');

const { ForbiddenError } = require('../errors/appErrors');

const { documents_x_educations } = require('../_testData');

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

// --------------------------------------------------
// createDocument_x_education

describe('createDocument_x_education', () => {
  beforeEach(() => {
    Education.get.mockReset();
    mockValidateDocumentOwner.mockReset();
    Document_X_Education.getAll.mockReset();
    mockGetLastPosition.mockReset();
    Document_X_Education.add.mockReset();
  });

  test.each([
    [Object.freeze([]), -1],
    [documents_x_educations, 1],
  ])(
    'Adds a Document_X_Education, if document is found and belongs to user, ' +
      'and at the correct next position.  Existing documents_x_educations = %j.',
    async (existingDocuments_x_educations, lastPosition) => {
      // Arrange
      const educationIdToAdd = 3;

      const mockDocument_x_education = Object.freeze({});
      Education.get.mockResolvedValue({ owner: username });
      Document_X_Education.getAll.mockResolvedValue(
        existingDocuments_x_educations
      );
      mockGetLastPosition.mockReturnValue(lastPosition);
      Document_X_Education.add.mockResolvedValue(mockDocument_x_education);

      // Act
      const document_x_education = await createDocument_x_education(
        username,
        documentId,
        educationIdToAdd
      );

      // Assert
      expect(document_x_education).toBe(mockDocument_x_education);

      expect(Education.get).toHaveBeenCalledWith({ id: educationIdToAdd });

      expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
        username,
        documentId,
        expect.any(String)
      );

      expect(Document_X_Education.getAll).toHaveBeenCalledWith(documentId);

      expect(mockGetLastPosition).toHaveBeenCalledWith(
        existingDocuments_x_educations
      );

      expect(Document_X_Education.add).toHaveBeenCalledWith({
        documentId,
        educationId: educationIdToAdd,
        position: lastPosition + 1,
      });
    }
  );

  test('Throws an Error if education does not belong to user.', async () => {
    // Arrange
    const educationIdToAdd = 3;

    const mockDocument_x_education = Object.freeze({});
    Education.get.mockResolvedValue({ owner: 'other user' });
    Document_X_Education.getAll.mockResolvedValue(documents_x_educations);
    mockGetLastPosition.mockReturnValue(1);
    Document_X_Education.add.mockResolvedValue(mockDocument_x_education);

    // Act
    async function runFunc() {
      await createDocument_x_education(username, documentId, educationIdToAdd);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);

    expect(Education.get).toHaveBeenCalledWith({ id: educationIdToAdd });

    expect(mockValidateDocumentOwner).not.toHaveBeenCalled();
    expect(Document_X_Education.getAll).not.toHaveBeenCalled();
    expect(mockGetLastPosition).not.toHaveBeenCalled();
    expect(Document_X_Education.add).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------
// updateEducation

describe('updateEducation', () => {
  const educationId = 1;
  const props = Object.freeze({ school: 'University 10' });

  const mockUpdatedEducation = Object.freeze({});
  const getMockOriginalEducation = (owner) =>
    Object.freeze({
      owner,
      update: jest.fn(async () => mockUpdatedEducation),
    });

  beforeEach(() => {
    mockValidateDocumentOwner.mockReset();
    Education.get.mockReset();
  });

  test('Updates an education.', async () => {
    // Arrange
    const mockOriginalEducation = getMockOriginalEducation(username);
    const document = { owner: username, isMaster: true };

    Education.get.mockResolvedValue(mockOriginalEducation);
    mockValidateDocumentOwner.mockResolvedValue(document);

    // Act
    const updatedEducation = await updateEducation(
      username,
      documentId,
      educationId,
      props
    );

    // Assert
    expect(updatedEducation).toBe(mockUpdatedEducation);
    expect(Education.get).toHaveBeenCalledWith({ id: educationId });
    expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
      username,
      documentId,
      expect.any(String)
    );
    expect(mockOriginalEducation.update).toHaveBeenCalledWith(props);
  });

  test('Throws an Error if education does not belong to user.', async () => {
    // Arrange
    const mockOriginalEducation = getMockOriginalEducation('otherUser');
    const document = { owner: username, isMaster: true };

    Education.get.mockResolvedValue(mockOriginalEducation);
    mockValidateDocumentOwner.mockResolvedValue(document);

    // Act
    async function runFunc() {
      await updateEducation(username, documentId, educationId, props);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);
    expect(Education.get).toHaveBeenCalledWith({ id: educationId });
    expect(mockValidateDocumentOwner).not.toHaveBeenCalled();
    expect(mockOriginalEducation.update).not.toHaveBeenCalled();
  });

  test('Throws an Error if document is not master.', async () => {
    // Arrange
    const mockOriginalEducation = getMockOriginalEducation(username);
    const document = { owner: username, isMaster: false };

    Education.get.mockResolvedValue(mockOriginalEducation);
    mockValidateDocumentOwner.mockResolvedValue(document);

    // Act
    async function runFunc() {
      await updateEducation(username, documentId, educationId, props);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);
    expect(Education.get).toHaveBeenCalledWith({ id: educationId });
    expect(mockValidateDocumentOwner).toHaveBeenCalledWith(
      username,
      documentId,
      expect.any(String)
    );
    expect(mockOriginalEducation.update).not.toHaveBeenCalled();
  });
});
