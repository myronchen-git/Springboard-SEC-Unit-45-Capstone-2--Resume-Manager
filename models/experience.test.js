'use strict';

const Experience = require('./experience');

const { runCommonTests } = require('./_testCommon');
const { users, experiences } = require('./_testData');

// ==================================================

const dataForNewInstances = experiences;

const dataForUpdate = Object.freeze(
  dataForNewInstances.map((data) =>
    Object.freeze({
      title: 'New ' + data.title,
      organization: 'New ' + data.organization,
      location: 'New Location',
      startDate: new Date(2050, 0, 10),
      endDate: new Date(2055, 0, 10),
    })
  )
);

const expectedDataInNewInstances = dataForNewInstances.map((data) => ({
  id: expect.any(Number),
  owner: data.owner,
  title: data.title,
  organization: data.organization,
  location: data.location,
  startDate: data.startDate,
  endDate: data.endDate || null,
}));

const whereClauseToGetOne = 'WHERE id = $1';
const whereClauseToGetAll = 'WHERE owner = $1';

// Don't freeze, because ID will be added later.
const testCasesForGet = [
  ['ID', { owner: users[0].username }, expectedDataInNewInstances[0]],
];

runCommonTests({
  class: Experience,
  tableName: Experience.tableName,
  dataForNewInstances,
  dataForUpdate,
  expectedDataInNewInstances,
  whereClauseToGetOne,
  whereClauseToGetAll,
  testCasesForGet,
});
