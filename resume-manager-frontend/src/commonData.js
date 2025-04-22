// Section IDs are the index positions.
const SECTION_ID_TO_DATABASE_NAME = Object.freeze([
  null,
  'educations',
  'experiences',
  'skills',
  'certifications',
  'projects',
]);

// --------------------------------------------------

// The following fields are for listing the correct fields in HTML forms.
// Always keep them up to date, with optional fields last!
// And always keep the optional fields start index up to date!

const CONTACT_INFO_FIELDS = Object.freeze(
  [
    { jsName: 'fullName', displayName: 'Full Name' },
    { jsName: 'location', displayName: 'Location' },
    { jsName: 'email', displayName: 'Email' },
    { jsName: 'phone', displayName: 'Phone' },
    { jsName: 'linkedin', displayName: 'LinkedIn' },
    { jsName: 'github', displayName: 'GitHub' },
  ].map((item) => Object.freeze(item))
);

const CONTACT_INFO_FIELDS_START_INDEX = 1;

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

const EDUCATION_OPTIONAL_FIELDS_START_INDEX = 5;

const EXPERIENCE_FIELDS = Object.freeze(
  [
    { jsName: 'title', displayName: 'Job Title' },
    { jsName: 'organization', displayName: 'Organization' },
    { jsName: 'location', displayName: 'Location' },
    { jsName: 'startDate', displayName: 'Start Date' },
    { jsName: 'endDate', displayName: 'End Date' },
  ].map((item) => Object.freeze(item))
);

const EXPERIENCE_OPTIONAL_FIELDS_START_INDEX = 4;

const TEXT_SNIPPET_FIELDS = Object.freeze(
  [{ jsName: 'content', displayName: 'Content' }].map((item) =>
    Object.freeze(item)
  )
);

const TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX = 1;

// --------------------------------------------------

// Mainly for handling dates in form inputs.
const getFormInputPlaceholder = (fieldName) =>
  fieldName.toLowerCase().includes('date') ? 'YYYY-MM-DD' : '';
const getFormInputPattern = (fieldName) =>
  fieldName.toLowerCase().includes('date')
    ? '^\\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$'
    : '.*';

// ==================================================

export {
  CONTACT_INFO_FIELDS,
  CONTACT_INFO_FIELDS_START_INDEX,
  EDUCATION_FIELDS,
  EDUCATION_OPTIONAL_FIELDS_START_INDEX,
  EXPERIENCE_FIELDS,
  EXPERIENCE_OPTIONAL_FIELDS_START_INDEX,
  SECTION_ID_TO_DATABASE_NAME,
  TEXT_SNIPPET_FIELDS,
  TEXT_SNIPPET_OPTIONAL_FIELDS_START_INDEX,
  getFormInputPattern,
  getFormInputPlaceholder,
};
