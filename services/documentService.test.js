'use strict';

const Document = require('../models/document');
const { updateDocument, deleteDocument } = require('./documentService');

const { ArgumentError } = require('../errors/modelErrors');
const { ForbiddenError, NotFoundError } = require('../errors/appErrors');

// ==================================================

jest.mock('../models/document');

// ==================================================

// --------------------------------------------------
// updateDocument

describe('updateDocument', () => {
  const username = 'user1';
  const documentId = '1';
  const props = Object.freeze({
    documentName: 'New name',
    isTemplate: false,
    isLocked: true,
  });

  const mockGet = jest.fn();
  const mockUpdate = jest.fn();

  beforeEach(() => {
    mockGet.mockReset();
    mockUpdate.mockReset();
  });

  test('Calls document.update if document is found and belongs to user.', async () => {
    // Arrange
    const document = { owner: username, isMaster: false };

    Document.get = mockGet.mockResolvedValue(document);
    document.update = mockUpdate.mockResolvedValue(document);

    Object.freeze(document);

    // Act
    const updatedDocument = await updateDocument(username, documentId, props);

    // Assert
    expect(updatedDocument).toBe(document);
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.update).toHaveBeenCalledWith(props);
  });

  test.each([[Object.freeze({ documentName: props.documentName })], [props]])(
    'If document is the master resume, calls document.update ' +
      'if documentName is given.',
    async (props) => {
      // Arrange
      const document = { owner: username, isMaster: true };

      Document.get = mockGet.mockResolvedValue(document);
      document.update = mockUpdate.mockResolvedValue(document);

      Object.freeze(document);

      // Act
      const updatedDocument = await updateDocument(username, documentId, props);

      // Assert
      expect(updatedDocument).toBe(document);
      expect(Document.get).toHaveBeenCalledWith({ id: documentId });
      expect(document.update).toHaveBeenCalledWith({
        documentName: props.documentName,
      });
    }
  );

  test('Throws an Error if document does not belong to user.', async () => {
    // Arrange
    const document = { owner: 'otherUser', isMaster: false };

    Document.get = mockGet.mockResolvedValue(document);
    document.update = mockUpdate.mockResolvedValue(document);

    // Act
    async function runFunc() {
      await updateDocument(username, documentId, props);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.update).not.toHaveBeenCalled();
  });

  test.each([[{}], [(({ documentName, ...rest }) => rest)(props)]])(
    'Throws an Error if document is the master resume ' +
      'and documentName is not given.',
    async (props) => {
      // Arrange
      const document = { owner: username, isMaster: true };

      Document.get = mockGet.mockResolvedValue(document);
      document.update = mockUpdate.mockResolvedValue(document);

      Object.freeze(document);

      // Act
      async function runFunc() {
        await updateDocument(username, documentId, props);
      }

      // Assert
      await expect(runFunc).rejects.toThrow(ArgumentError);
      expect(Document.get).toHaveBeenCalledWith({ id: documentId });
      expect(document.update).not.toHaveBeenCalled();
    }
  );

  // This test may not be necessary, because the standard is to continue
  // throwing up Errors.
  test('Passes along other Errors from Document.get.', async () => {
    // Arrange
    const document = { owner: username, isMaster: false };

    Document.get = mockGet.mockRejectedValue(new Error());
    document.update = mockUpdate.mockResolvedValue(document);

    // Act
    async function runFunc() {
      await updateDocument(username, documentId, props);
    }

    // Assert
    await expect(runFunc).rejects.toThrow();
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.update).not.toHaveBeenCalled();
  });

  // This test may not be necessary, because the standard is to continue
  // throwing up Errors.
  test('Passes along other Errors from Document.update.', async () => {
    // Arrange
    const document = { owner: username, isMaster: false };

    Document.get = mockGet.mockResolvedValue(document);
    document.update = mockUpdate.mockRejectedValue(new Error());

    // Act
    async function runFunc() {
      await updateDocument(username, documentId, props);
    }

    // Assert
    await expect(runFunc).rejects.toThrow();
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
    expect(document.update).toHaveBeenCalledWith(props);
  });
});

// --------------------------------------------------
// deleteDocument

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
