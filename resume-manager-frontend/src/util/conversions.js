// ==================================================

/**
 * Converts a date from ISO format to abbreviated month and year.  Keep in mind
 * that toLocaleDateString is slow.
 *
 * @param {String} dateIso - Date in "YYYY-MM-DD".
 * @returns {String} Date in "(abbrev.)month year".
 */
function generateDateString(dateIso) {
  return new Date(dateIso).toLocaleDateString('UTC', {
    year: 'numeric',
    month: 'short',
  });
}

/**
 * Converts a timestamp from ISO format to local date and time.  Keep in mind
 * that toLocaleString is slow.
 *
 * @param {String} dateTimeIso - Timestamp in "YYY-MM-DDTHH:mm:ss.sssZ".
 * @returns {String} Date and time in local format, such as "Monday, April 28,
 *  2025 at 7:28 AM".
 */
function generateDateTimeString(dateTimeIso) {
  return new Date(dateTimeIso).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

// ==================================================

export { generateDateString, generateDateTimeString };
