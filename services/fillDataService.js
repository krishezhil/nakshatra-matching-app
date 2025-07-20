// services/dataService.js
// const fetch = require('node-fetch');
const dotenv = require('dotenv');
const logger = require("../app/utils/logger");

// Load environment variables from .env file
dotenv.config();


exports.fetchProfileData = async (serialNo) => {
  try {
    const host = process.env.API_HOST;
    const port = process.env.API_PORT;
    const uri = process.env.API_SEARCH_URI;
    const url = `http://${host}:${port}${uri}?serial_no=${serialNo}`;

    const responseSearch = await fetch(url);

    if (!responseSearch.ok) {
      throw new Error(`Error fetching data: ${responseSearch.statusText}`);
    }

    const dataRes = await responseSearch.json();

    // Extract the required properties from the response
    const processedData = dataRes.map(obj => ({
      gender: obj.gender,
      gothram: obj.gothram,
      nakshatram: obj.nakshatram,
    }));

    return processedData;
  } catch (error) {
    if (error.name === 'FetchError') {
      logger.error(`Network error occurred:  ${error.message}`);
    } else if (error.name === 'SyntaxError') {
      logger.error(`Response is not valid JSON:  ${error}`);
    } else {
      logger.error(`Unexpected error:  ${error}`);
    }
    throw error; // Re-throw the error after logging it
  }
};
