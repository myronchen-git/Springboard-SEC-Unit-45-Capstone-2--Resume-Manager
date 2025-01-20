const users = Object.freeze([
  Object.freeze({ username: 'user1', password: '123' }),
  Object.freeze({ username: 'user2', password: '123' }),
]);

const documents = Object.freeze([
  Object.freeze({
    documentName: 'doc1',
    owner: users[0].username,
    isMaster: true,
    isTemplate: false,
  }),
  Object.freeze({
    documentName: 'doc2',
    owner: users[0].username,
    isMaster: false,
    isTemplate: true,
  }),
]);

const numSections = 2;
const sections = new Array(numSections);
for (let i = 1; i <= numSections; i++) {
  sections[i - 1] = Object.freeze({ sectionName: `section${i}` });
}
Object.freeze(sections);

// ==================================================

module.exports = { users, documents, sections };
