import { useMemo } from 'react';

import { generateDateString } from '../../util/conversions.js';

// ==================================================

/**
 * Helper component to purely display the text of an experience, but not its
 * bullets / text snippets.
 *
 * @param {Object} props - React component properties.
 */
function ExperienceText({ experience, children }) {
  const startDateString = useMemo(
    () => generateDateString(experience.startDate),
    [experience]
  );
  const endDateString = useMemo(
    () =>
      experience.endDate ? generateDateString(experience.endDate) : 'Present',
    [experience]
  );

  return (
    <>
      <p className="section-item-text__p1">
        <b>{experience.organization}</b>
        <br />
        {experience.title}
      </p>
      <p className="section-item-text__p2">
        {experience.location}
        <br />
        {startDateString} - {endDateString}
      </p>
      {children}
    </>
  );
}

// ==================================================

export default ExperienceText;
