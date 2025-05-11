'use strict';

const { deleteItem } = require('./commonServices');
const {
  validateOwnership: mockValidateOwnership,
} = require('../util/serviceHelpers');

const { NotFoundError } = require('../errors/appErrors');

// ==================================================

jest.mock('../util/serviceHelpers');

// ==================================================

const username = 'user1';

// Generic class representing Document, Education, Experience, TextSnippet, or
// etc..
const GenericClass = Object.freeze({
  name: 'GenericClass',
});

// --------------------------------------------------
// deleteItem

describe('deleteItem', () => {
  const idObj = Object.freeze({ id: 1 });
  const itemMock = Object.freeze({ delete: jest.fn() });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('Deletes an item.', async () => {
    // Arrange
    mockValidateOwnership.mockResolvedValue(itemMock);

    // Act
    await deleteItem(GenericClass, username, idObj);

    // Assert
    expect(mockValidateOwnership).toHaveBeenCalledWith(
      GenericClass,
      username,
      idObj,
      expect.any(String)
    );

    expect(itemMock.delete).toHaveBeenCalled();
  });

  test('Runs extra function.', async () => {
    // Arrange
    const mockFunction = jest.fn();

    mockValidateOwnership.mockResolvedValue(itemMock);

    // Act
    await deleteItem(GenericClass, username, idObj, mockFunction);

    // Assert
    expect(mockValidateOwnership).toHaveBeenCalledWith(
      GenericClass,
      username,
      idObj,
      expect.any(String)
    );

    expect(mockFunction).toHaveBeenCalledWith(itemMock);

    expect(itemMock.delete).toHaveBeenCalled();
  });

  test(
    'If item is not found when validating ownership, ' +
      'then immediately return.',
    async () => {
      // Arrange
      mockValidateOwnership.mockRejectedValue(new NotFoundError());

      // Act
      await deleteItem(GenericClass, username, idObj);

      // Assert
      expect(mockValidateOwnership).toHaveBeenCalledWith(
        GenericClass,
        username,
        idObj,
        expect.any(String)
      );

      expect(itemMock.delete).not.toHaveBeenCalled();
    }
  );

  test(
    'If an unknown Error is thrown while validating ownership, ' +
      'then rethrow it.',
    async () => {
      // Arrange
      mockValidateOwnership.mockRejectedValue(new Error());

      // Act/Assert
      await expect(deleteItem(GenericClass, username, idObj)).rejects.toThrow();

      // Assert
      expect(mockValidateOwnership).toHaveBeenCalledWith(
        GenericClass,
        username,
        idObj,
        expect.any(String)
      );

      expect(itemMock.delete).not.toHaveBeenCalled();
    }
  );
});
