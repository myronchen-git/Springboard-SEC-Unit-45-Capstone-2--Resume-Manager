import axios from '../node_modules/axios';

// ==================================================

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/v1';

// --------------------------------------------------

/**
 * A class to hold the API functions that call the back-end.
 */
class ResumeManagerApi {
  static authToken = null;

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
    const headers = { Authorization: `Bearer ${ResumeManagerApi.authToken}` };
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
}

// ==================================================

export default ResumeManagerApi;
