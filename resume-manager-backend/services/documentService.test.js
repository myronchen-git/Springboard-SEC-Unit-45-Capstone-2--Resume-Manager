'use strict';

const Document = require('../models/document');
const { updateDocument, deleteDocument } = require('./documentService');
const { deleteItem: mockDeleteItem } = require('./commonServices');
const {
  validateOwnership: mockValidateOwnership,
} = require('../util/serviceHelpers');

const { ForbiddenError, ArgumentError } = require('../errors/appErrors');

// ==================================================

jest.mock('../models/document');
jest.mock('./commonServices');
jest.mock('../util/serviceHelpers');

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

  const mockUpdate = jest.fn();

  beforeEach(() => {
    mockValidateOwnership.mockReset();
    mockUpdate.mockReset();
  });

  test.each([[{}], [props]])(
    'Updates document properties for non-master document.',
    async (props) => {
      // Arrange
      const document = { owner: username, isMaster: false };

      mockValidateOwnership.mockResolvedValue(document);
      document.update = mockUpdate.mockResolvedValue(document);

      Object.freeze(document);

      // Act
      const updatedDocument = await updateDocument(username, documentId, props);

      // Assert
      expect(updatedDocument).toBe(document);
      expect(mockValidateOwnership).toHaveBeenCalledWith(
        Document,
        username,
        { id: documentId },
        expect.any(String)
      );
      expect(document.update).toHaveBeenCalledWith(props);
    }
  );

  test(
    'If document is the master resume, updates document ' +
      'if only documentName is given.',
    async () => {
      // Arrange
      const document = { owner: username, isMaster: true };
      const updatedProps = Object.freeze({ documentName: props.documentName });

      mockValidateOwnership.mockResolvedValue(document);
      document.update = mockUpdate.mockResolvedValue(document);

      Object.freeze(document);

      // Act
      const updatedDocument = await updateDocument(
        username,
        documentId,
        updatedProps
      );

      // Assert
      expect(updatedDocument).toBe(document);
      expect(mockValidateOwnership).toHaveBeenCalledWith(
        Document,
        username,
        { id: documentId },
        expect.any(String)
      );
      expect(document.update).toHaveBeenCalledWith({
        documentName: updatedProps.documentName,
      });
    }
  );

  test.each([
    [
      'documentName is not given.',
      (({ documentName, ...rest }) => rest)(props),
    ],
    ['properties other than documentName are also given.', [props]],
  ])(
    'Throws an Error if document is the master resume and %s',
    async (testTitle, props) => {
      // Arrange
      const document = { owner: username, isMaster: true };

      mockValidateOwnership.mockResolvedValue(document);
      document.update = mockUpdate.mockResolvedValue(document);

      Object.freeze(document);

      // Act
      async function runFunc() {
        await updateDocument(username, documentId, props);
      }

      // Assert
      await expect(runFunc).rejects.toThrow(ArgumentError);
      expect(mockValidateOwnership).toHaveBeenCalledWith(
        Document,
        username,
        { id: documentId },
        expect.any(String)
      );
      expect(document.update).not.toHaveBeenCalled();
    }
  );
});

// --------------------------------------------------
// deleteDocument

describe('deleteDocument', () => {
  const username = 'user1';
  const documentId = '1';

  beforeEach(() => {
    mockDeleteItem.mockReset();
  });

  test('Does not throw an Error if the document is not the master resume.', async () => {
    // Arrange
    const document = { owner: username, isMaster: false };

    mockDeleteItem.mockImplementation(
      (_classRef, _username, _id, runExtraFunction) =>
        Promise.resolve(runExtraFunction(document))
    );

    // Act
    await deleteDocument(username, documentId);

    // Assert
    expect(mockDeleteItem).toHaveBeenCalledWith(
      Document,
      username,
      { id: documentId },
      expect.any(Function)
    );
  });

  test('Throws an Error if the document is the master resume.', async () => {
    // Arrange
    const document = { owner: username, isMaster: true };

    mockDeleteItem.mockImplementation(
      (_classRef, _username, _id, runExtraFunction) =>
        Promise.resolve(runExtraFunction(document))
    );

    // Act
    async function runFunc() {
      await deleteDocument(username, documentId);
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);

    expect(mockDeleteItem).toHaveBeenCalledWith(
      Document,
      username,
      { id: documentId },
      expect.any(Function)
    );
  });
});
