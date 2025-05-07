import { createContext } from 'react';

// ==================================================

/**
 * For holding general app variables and functions that don't fit anywhere else.
 */
const AppContext = createContext({});

/**
 * For holding user or account related variables and functions.
 */
const UserContext = createContext({});

/**
 * Holds access to the document state.
 */
const DocumentContext = createContext(null);

/**
 * Holds text snippet functions.
 */
const TextSnippetContext = createContext({});

// ==================================================

export { AppContext, DocumentContext, TextSnippetContext, UserContext };
