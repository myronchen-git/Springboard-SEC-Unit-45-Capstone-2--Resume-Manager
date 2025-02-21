'use strict';

const Document = require('../models/document');
const { validateDocumentOwner } = require('./serviceHelpers');

const { ForbiddenError } = require('../errors/appErrors');

// ==================================================

jest.mock('../models/document');

// ==================================================

describe('validateDocumentOwner', () => {
  const username = 'user1';
  const documentId = '1';

  const mockGet = jest.fn();

  beforeEach(() => {
    mockGet.mockReset();
  });

  test('Returns the specified document if it belongs to the specified user.', async () => {
    // Arrange
    const document = Object.freeze({ owner: username });

    Document.get = mockGet.mockResolvedValue(document);

    // Act
    const returnedDocument = await validateDocumentOwner(
      username,
      documentId,
      ''
    );

    // Assert
    expect(returnedDocument).toEqual(document);
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
  });

  test('Throws an Error if document does not belong to user.', async () => {
    // Arrange
    const document = { owner: 'otherUser' };

    Document.get = mockGet.mockResolvedValue(document);

    // Act
    async function runFunc() {
      await validateDocumentOwner(username, documentId, '');
    }

    // Assert
    await expect(runFunc).rejects.toThrow(ForbiddenError);
    expect(Document.get).toHaveBeenCalledWith({ id: documentId });
  });
});
