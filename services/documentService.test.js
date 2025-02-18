'use strict';

const Document = require('../models/document');
const { deleteDocument } = require('./documentService');

const { ForbiddenError, NotFoundError } = require('../errors/appErrors');

// ==================================================

jest.mock('../models/document');

// ==================================================

describe('deleteDocument', () => {
  const username = 'user1';
  const documentId = '1';

  const mockGet = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    mockGet.mockReset();
    mockDelete.mockReset();
  });

  test('Calls document.delete if document is found and belongs to user.', async () => {
    // Arrange
    const document = { owner: username };

    Document.get = mockGet.mockResolvedValue(document);
    document.delete = mockDelete;

    // Act
    await deleteDocument(username, documentId);

    // Assert
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.delete).toHaveBeenCalled();
  });

  test('Throws an Error if document does not belong to user.', async () => {
    // Arrange
    const document = { owner: 'otherUser' };

    Document.get = mockGet.mockResolvedValue(document);
    document.delete = mockDelete;

    // Act
    async function runFunc() {
      await deleteDocument(username, documentId);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.delete).not.toHaveBeenCalled();
  });

  test('Does not throw an Error if document is not found.', async () => {
    // Arrange
    const document = { owner: username };

    Document.get = mockGet.mockRejectedValue(new NotFoundError());
    document.delete = mockDelete;

    // Act
    await deleteDocument(username, documentId);

    // Assert
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.delete).not.toHaveBeenCalled();
  });

  test('Passes along other Errors from Document.get.', async () => {
    // Arrange
    const document = { owner: username };

    Document.get = mockGet.mockRejectedValue(new Error());
    document.delete = mockDelete;

    // Act
    async function runFunc() {
      await deleteDocument(username, documentId);
    }

    // Assert
    await expect(runFunc).rejects.toThrow();
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.delete).not.toHaveBeenCalled();
  });

  test('Passes along other Errors from document.delete.', async () => {
    // Arrange
    const document = { owner: username };

    Document.get = mockGet.mockResolvedValue(document);
    document.delete = mockDelete.mockRejectedValue(new Error());

    // Act
    async function runFunc() {
      await deleteDocument(username, documentId);
    }

    // Assert
    await expect(runFunc).rejects.toThrow();
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.delete).toHaveBeenCalled();
  });
});
