/** Holds common test data that might be used across all tests. */

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

const textSnippets = Object.freeze([
  Object.freeze({
    owner: users[0].username,
    type: 'paragraph',
    content: 'content1',
  }),
  Object.freeze({
    owner: users[0].username,
    type: 'bullet point',
    content: 'content2',
  }),
]);

const educations = Object.freeze([
  Object.freeze({
    owner: users[0].username,
    school: 'School 1',
    location: 'Location 1',
    startDate: new Date(2020, 11, 1),
    endDate: new Date(2024, 6, 20),
    degree: 'Degree 1',
  }),
  Object.freeze({
    owner: users[0].username,
    school: 'University of California,',
    location: 'Los Angeles',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2030, 0, 1),
    degree: "Bachelor's of Science, Computer Science",
    gpa: '4.0 / 4.0',
    awardsAndHonors: 'Award 1, Honors 1',
    activities: 'Extracurricular Activity 1, Extracurricular Activity 2',
  }),
]);

const experiences = Object.freeze([
  Object.freeze({
    owner: users[0].username,
    title: 'Software Engineer I',
    organization: 'Company 1',
    location: 'City 1, State 1, Country',
    startDate: new Date(2000, 1, 2),
  }),
  Object.freeze({
    owner: users[0].username,
    title: 'Full-Stack Engineer I',
    organization: 'Company 100',
    location: 'City 100, State 100, Country',
    startDate: new Date(2000, 9, 8),
    endDate: new Date(2020, 11, 30),
  }),
]);

// ==================================================

module.exports = {
  users,
  documents,
  sections,
  textSnippets,
  educations,
  experiences,
};
