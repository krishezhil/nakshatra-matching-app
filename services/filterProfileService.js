// services/profileService.js
// const fetch = require('node-fetch');
require('dotenv').config(); // Load environment variables from .env

exports.getProfileDetails = async (serialNo) => {
  try {
    const host = process.env.API_HOST;
    const port = process.env.API_PORT;
    const uri = process.env.API_SEARCH_URI;
    
    const url = `http://${host}:${port}${uri}?serial_no=${serialNo}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching profile details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile details:', error);
    throw error; // Re-throw the error to propagate it to the caller
  }
};

exports.findMatchingProfiles = async (queryParams, gender) => {
  try {
    const endpoint = `findMatching${gender === 'Female' ? 'Male' : 'Female'}`;
    const queryString = new URLSearchParams(queryParams).toString();
    const baseUrl = process.env.API_BASE_URL;
    const url = baseUrl+ `${endpoint}?${queryString}`;
    console.log('api url'+url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error finding matching profiles: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error finding matching profiles:', error);
    throw error; // Re-throw the error to propagate it to the caller
  }
};
