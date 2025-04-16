// Section IDs are the index positions.
const SECTION_ID_TO_DATABASE_NAME = Object.freeze([
  null,
  'educations',
  'experiences',
  'skills',
  'certifications',
  'projects',
]);

// For listing the correct fields in HTML forms.
// Always keep up to date, with optional fields last!
const EDUCATION_FIELDS = Object.freeze(
  [
    { jsName: 'school', displayName: 'School Name' },
    { jsName: 'location', displayName: 'Location' },
    { jsName: 'startDate', displayName: 'Start Date' },
    { jsName: 'endDate', displayName: 'End Date' },
    { jsName: 'degree', displayName: 'Degree' },
    { jsName: 'gpa', displayName: 'GPA' },
    { jsName: 'awardsAndHonors', displayName: 'Awards And Honors' },
    { jsName: 'activities', displayName: 'Activities' },
  ].map((item) => Object.freeze(item))
);

// For listing the correct fields in HTML forms.
// Always keep up to date!
const EDUCATION_OPTIONAL_FIELDS_START_INDEX = 5;

// Mainly for handling dates in form inputs.
const getFormInputPlaceholder = (fieldName) =>
  fieldName.toLowerCase().includes('date') ? 'YYYY-MM-DD' : '';
const getFormInputPattern = (fieldName) =>
  fieldName.toLowerCase().includes('date')
    ? '^\\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$'
    : '.*';

// ==================================================

export {
  EDUCATION_FIELDS,
  EDUCATION_OPTIONAL_FIELDS_START_INDEX,
  SECTION_ID_TO_DATABASE_NAME,
  getFormInputPattern,
  getFormInputPlaceholder,
};
