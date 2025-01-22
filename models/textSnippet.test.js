'use strict';

const TextSnippet = require('./textSnippet');

const { runCommonTests } = require('./_testCommon');
const {
  dataForNewInstances,
  dataForUpdate,
  expectedDataInNewInstances,
  whereClauseToGetOne,
  whereClauseToGetAll,
  testCasesForGet,
} = require('./_textSnippetTestData');

// ================================================== Common Tests

runCommonTests({
  class: TextSnippet,
  tableName: 'text_snippets',
  dataForNewInstances,
  dataForUpdate,
  expectedDataInNewInstances,
  whereClauseToGetOne,
  whereClauseToGetAll,
  testCasesForGet,
});
