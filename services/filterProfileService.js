// services/profileService.js
// const fetch = require('node-fetch');
require('dotenv').config(); // Load environment variables from .env
const { log } = require('winston');
const logger = require("../app/utils/logger");

exports.getProfileDetails = async (serialNo) => {
  try {
    const host = process.env.API_HOST;
    const port = process.env.API_PORT;
    const uri = process.env.API_SEARCH_URI;
    
    const url = `http://${host}:${port}${uri}?serial_no=${serialNo}`;

    const response = await fetch(url);
    logger.info(`api url ${url}`);
    // Check if the response is ok (status in the range 200-299)
    logger.info(`Response status: ${response.status}`);
    logger.info(`Response status text: ${response.statusText}`);

 // Return empty data array if status is 404 or data not found
    if (response.status === 404) {
      logger.warn(`No data found for serial_no: ${serialNo}`);
      return { success: true, data: [] };
    }

    if (!response.ok) {
            logger.error(`Fetch failed with status: ${response.statusText}`);
      return { success: false, message: response.statusText };
    }

    const data = await response.json();
     // Check for empty or undefined data and normalize it
    if (!data || (Array.isArray(data) && data.length === 0)) {
      logger.info(`Empty data returned for serial_no: ${serialNo}`);
      return { success: true, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    logger.error(`Error fetching profile details in Service: ${error}`);
    return { success: false, message: 'Server error while fetching profile' };
  }
};

// exports.findMatchingProfiles = async (queryParams, gender) => {
//   try {
//     const endpoint = `findMatching${gender === 'Female' ? 'Male' : 'Female'}`;
//     const queryString = new URLSearchParams(queryParams).toString();
//     const baseUrl = process.env.API_BASE_URL;
//     const url = baseUrl+ `${endpoint}?${queryString}`;
//     logger.info(`find matching Profile api url ${url}`);
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`Error finding matching profiles: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     logger.error(`Error finding matching profiles: ${error}`);
//     throw error; // Re-throw the error to propagate it to the caller
//   }
// };


exports.findMatchingProfiles = async (queryParams, gender) => {
  try {
    const endpoint = `findMatching${gender === 'Female' ? 'Male' : 'Female'}`;
    const queryString = new URLSearchParams(queryParams).toString();
    const baseUrl = process.env.API_BASE_URL;
    const url = `${baseUrl}${endpoint}?${queryString}`;

    logger.info(`find matching Profile api url ${url}`);
    const response = await fetch(url);
    logger.info(`Response status: ${response.status}`);
    logger.info(`Response status text: ${response.statusText}`);
    // logger.info(`Response: ${JSON.stringify(response.data)}`);
    if (!response.ok) {
      const errorText = await response.text();
      logger.warn(`Matching profile fetch failed: ${errorText}`);
      return {
        success: false,
        message: `API call failed with status ${response.status}: ${response.statusText}`,
        data: [],
      };
    }

    const data = await response.json();
    logger.info(`Response JSON: ${JSON.stringify(data)}`)
    const profiles = {
      success: true,
      message: "Profiles fetched successfully",
      data: data || [],
    }
    logger.info(`Profiles found: ${JSON.stringify(profiles)}`);
    return profiles;
  } catch (error) {
    logger.error(`Error finding matching profiles: ${error}`);
    return {
      success: false,
      message: "Internal error while fetching profiles",
      data: [],
    };
  }
};
