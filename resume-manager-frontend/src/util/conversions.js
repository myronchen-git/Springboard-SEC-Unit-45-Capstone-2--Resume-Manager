// ==================================================

/**
 * Helps to convert a date from ISO format to abbreviated month and year.
 *
 * @param {String} dateString - Date in "YYYY-MM-DD".
 * @returns {String} Date in "(abbrev.)month year".
 */
function generateDateString(dateString) {
  return new Date(dateString).toLocaleDateString('UTC', {
    year: 'numeric',
    month: 'short',
  });
}

// ==================================================

export { generateDateString };
