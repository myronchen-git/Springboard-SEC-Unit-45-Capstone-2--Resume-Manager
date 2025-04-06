import { jwtDecode } from 'jwt-decode';
import axios from '../node_modules/axios';

// ==================================================

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/v1';

// --------------------------------------------------

/**
 * A class to hold the API functions that call the back-end.
 */
class ResumeManagerApi {
  static #authToken;

  static {
    this.#authToken = localStorage.getItem('authToken');
  }

  static get authToken() {
    return this.#authToken;
  }

  static set authToken(token) {
    if (token == null) {
      localStorage.removeItem('authToken');
      this.#authToken = null;
    } else {
      localStorage.setItem('authToken', token);
      this.#authToken = token;
    }
  }

  // --------------------------------------------------

  /**
   * Makes an HTTP request and handles any errors from that.
   *
   * @param {String} endpoint - The API endpoint to call.
   * @param {Object} data - If the method is GET, this will be used for the
   *  query parameters.  Else, this will be in the request body.
   * @param {String} method - The HTTP method.
   * @returns {Object} The response data.
   */
  static async request(endpoint, data = {}, method = 'get') {
    console.debug('API Call: ', endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${this.authToken}` };
    const params = method === 'get' ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      const requestConfigErrorMessage = 'API Error: Request configuration:\n';

      if (err.response) {
        // Request made & server responded.

        console.error(
          'API Error: The request was made and the server responded ' +
            'with a status code outside of 2xx.\n',
          err.response.data,
          err.response.status,
          err.response.headers
        );
        console.error(requestConfigErrorMessage, err.config);

        const errorMessage = err.response.data.error.message;
        throw Array.isArray(errorMessage) ? errorMessage : [errorMessage];
      } else if (err.request) {
        // Request made, but no response.

        const errorMessage =
          'The request was made but no response was received.';

        // `error.request` is an instance of XMLHttpRequest in the browser and
        // an instance of http.ClientRequest in node.js.
        console.error('API Error: %s\n', errorMessage, err.request);
        console.error(requestConfigErrorMessage, err.config);

        throw [errorMessage];
      } else {
        // Request not made.

        const errorMessage =
          'Something happened in setting up the request ' +
          'that triggered an Error.';

        console.error('API Error: %s\n', errorMessage, err.message);
        console.error(requestConfigErrorMessage, err.config);

        throw [errorMessage];
      }
    }
  }

  // --------------------------------------------------
  // Individual API routes

  /**
   * Registers a new user.
   *
   * @param {Object} user - { username, password }
   * @returns {Object} Decoded authentication token, which should be user data.
   */
  static async registerUser(user) {
    const res = await this.request('auth/register', user, 'post');
    this.authToken = res.authToken;
    return jwtDecode(res.authToken);
  }

  /**
   * Signs in a user.
   *
   * @param {Object} user - { username, password }
   * @returns {Object} Decoded authentication token, which should be user data.
   */
  static async signinUser(user) {
    const res = await this.request('auth/signin', user, 'post');
    this.authToken = res.authToken;
    return jwtDecode(res.authToken);
  }

  /**
   * Updates account-related info, like password.
   *
   * @param {String} username - Name of the user.
   * @param {Object} user - Contains the data for updating account.
   * @param {String} user.oldPassword - Old password of the user.
   * @param {String} user.newPassword - New password of the user.
   * @returns {Object} Account info of the user, such as username.
   */
  static async updateAccount(username, user) {
    const res = await this.request(`users/${username}`, user, 'patch');
    return res.user;
  }

  /**
   * Creates a new resume or template.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {Object} data - Holds the info for creating a new document.
   * @param {String} data.documentName - Name of the new document.
   * @param {Boolean} data.isTemplate - Whether this new document should be a
   *  template.
   * @returns {Object} Returns the properties of the document.
   */
  static async createDocument(username, data) {
    const res = await this.request(`users/${username}/documents`, data, 'post');
    return res.document;
  }

  /**
   * Gets a user's contact information, such as full name, location, and email.
   *
   * @param {String} username - Name of the user accessing the website.
   * @returns {Object} Contact information data.s
   */
  static async getContactInfo(username) {
    const res = await this.request(`users/${username}/contact-info`);
    return res.contactInfo;
  }

  /**
   * Gets all documents and their properties.  This does not get the contents,
   * such as education and experience.
   *
   * @param {String} username - Name of the user accessing the website.
   * @returns {Object} Returns a list of documents containing all info of each
   *  document.
   */
  static async getDocuments(username) {
    const res = await this.request(`users/${username}/documents`);
    return res.documents;
  }

  /**
   * Gets a document with all its contents.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {String} documentId - ID of the document to retrieve.
   * @returns {Object} Document properties, contact info, education, experience,
   *  etc.
   */
  static async getDocument(username, documentId) {
    const res = await this.request(`users/${username}/documents/${documentId}`);
    return res.document;
  }

  /**
   * Gets all allowed sections that a resume can contain.
   *
   * @returns {Object[]} A list of sections, in the form of Objects, that can be
   *  used in documents.
   */
  static async getSections() {
    const res = await this.request('sections');
    return res.sections;
  }

  /**
   * Attaches a section to a document.  In other words, creates a
   * document-section relationship.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {String} documentId - ID of the document to add a section to.
   * @param {String} sectionId - ID of the section to add.
   * @returns {Object} The document_x_section Object, which contains document
   *  ID, section ID, and position of section within document.
   */
  static async addSection(username, documentId, sectionId) {
    const res = await this.request(
      `users/${username}/documents/${documentId}/sections/${sectionId}`,
      {},
      'post'
    );
    return res.document_x_section;
  }

  /**
   * Deletes a section from a document.  Since sections are currently not
   * user-created, this will delete the document-section relationships.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {String} documentId - ID of the document to remove a section from.
   * @param {String} sectionId - ID of the section to remove.
   */
  static async deleteSection(username, documentId, sectionId) {
    await this.request(
      `users/${username}/documents/${documentId}/sections/${sectionId}`,
      {},
      'delete'
    );
  }

  /**
   * Creates a new education entry and adds it to a document.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {String} documentId - ID of the document to add an education to.
   * @param {Object} data - Holds the info for creating a new education.
   * @param {String} data.school - School or education center name.
   * @param {String} data.location - Location of school.
   * @param {String} data.startDate - The start date of joining the school.
   * @param {String} data.endDate - The end date of leaving the school.
   * @param {String} data.degree - The degree name that was or will be given
   *  from the school.
   * @param {String} [data.gpa] - The grade point average throughout the
   *  attendance.
   * @param {String} [data.awardsAndHonors] - Any awards or honors given by the
   *  school.
   * @param {String} [data.activities] - Any activities done in relation to the
   *  school.
   * @returns {{
   *    education: Object,
   *    document_x_education: Object
   *  }}
   *  education - The education ID and all of the given info.
   *  document_x_education - The document ID that owns the education, the
   *  education ID, and the position of the education among other educations in
   *  the document.
   */
  static async addEducation(username, documentId, data) {
    return await this.request(
      `users/${username}/documents/${documentId}/educations`,
      data,
      'post'
    );
  }

  /**
   * Deletes an education entry from the database.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {String} educationId - ID of the education to delete.
   */
  static async deleteEducation(username, educationId) {
    await this.request(
      `users/${username}/educations/${educationId}`,
      {},
      'delete'
    );
  }

  /**
   * Removes an education from a document, but does not delete the entry itself.
   * This is used for non-master resumes.
   *
   * @param {String} username - Name of the user accessing the website.
   * @param {String} documentId - ID of the document to remove the education
   *  from.
   * @param {String} educationId - ID of the education to remove.
   */
  static async removeEducationFromDocument(username, documentId, educationId) {
    await this.request(
      `users/${username}/documents/${documentId}/educations/${educationId}`,
      {},
      'delete'
    );
  }
}

// ==================================================

export default ResumeManagerApi;
