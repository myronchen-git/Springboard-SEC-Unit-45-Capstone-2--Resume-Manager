import { Fragment, useMemo } from 'react';

import { generateDateString } from '../../../util/conversions.js';

// ==================================================

/**
 * Helper component to purely display the text of an education.
 *
 * @param {Object} props - React component properties.
 * @param {Object} props.education - Contains the education info to display.
 */
function EducationText({ education }) {
  const startDateString = useMemo(
    () => generateDateString(education.startDate),
    [education]
  );
  const endDateString = useMemo(
    () => generateDateString(education.endDate),
    [education]
  );

  const extraText = useMemo(() => {
    if (education.awardsAndHonors || education.activities) {
      const text = [];

      if (education.awardsAndHonors)
        text.push('Awards and Honors: ' + education.awardsAndHonors);
      if (education.activities)
        text.push('Activities: ' + education.activities);

      return (
        <p className="section-item-text__p3">
          {text.map((t, idx) => (
            <Fragment key={t}>
              {t}
              {idx !== text.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      );
    }
  }, [education]);

  return (
    <>
      <p className="section-item-text__p1">
        <b>{education.school}</b>
        <br />
        {education.degree}
        {education.gpa && (
          <>
            <br />
            {education.gpa}
          </>
        )}
      </p>
      <p className="section-item-text__p2">
        {education.location}
        <br />
        {startDateString} - {endDateString}
      </p>
      {extraText}
    </>
  );
}

// ==================================================

export default EducationText;
