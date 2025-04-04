import { Card, CardBody, CardTitle } from 'reactstrap';

// ==================================================

// Section IDs are the index positions.
const sectionIdToSectionComponent = [null];

// --------------------------------------------------

/**
 * Renders a card that contains the section name and its contents.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.section - Contains generic section info.
 * @param {Number} props.section.id - ID number of section.
 * @param {String} props.section.sectionName - Name of the section for
 *  displaying on document.
 * @param {Object[]} props.items - The items of a section, such as individual
 *  educations or experiences.
 */
function SectionCard({ section, items }) {
  // Note that section.id must be an integer > 0.
  const SectionComponent = sectionIdToSectionComponent[section.id];

  const renderedItems =
    SectionComponent == undefined
      ? null
      : items.map((item) => <SectionComponent key={item.id} item={item} />);

  return (
    <Card className="text-center" data-id={section.id}>
      <CardTitle>{section.sectionName}</CardTitle>
      <CardBody>{renderedItems}</CardBody>
    </Card>
  );
}

// ==================================================

export default SectionCard;
