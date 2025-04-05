import { createContext } from 'react';

// ==================================================

/**
 * For holding user or account related variables and functions.
 */
const UserContext = createContext({});

/**
 * Holds access to the document state.
 */
const DocumentContext = createContext(null);

// ==================================================

export { DocumentContext, UserContext };
