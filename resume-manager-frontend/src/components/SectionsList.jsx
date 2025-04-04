import SectionCard from './SectionCard.jsx';

// ==================================================

// Section IDs are the index positions.
const sectionIdToDatabaseName = [
  null,
  'educations',
  'experiences',
  'skills',
  'certifications',
  'projects',
];

// --------------------------------------------------

/**
 * Renders a list of sections for a resume.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.document - Contains section info and contents.
 */
function SectionsList({ document }) {
  const existingSections = document?.sections
    ? document.sections.map((section) => {
        // Note that section.id must be an integer > 0.
        const databaseName = sectionIdToDatabaseName[section.id];

        return (
          <SectionCard
            key={section.id}
            section={section}
            items={document[databaseName] || []}
          />
        );
      })
    : [];

  return <article>{existingSections}</article>;
}

// ==================================================

export default SectionsList;
