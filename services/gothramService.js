// services/gothramService.js
// const pool = require('../db'); // Adjust the path to your database connection file
const pool = require('../app/config/dbconfig').pool;
const logger = require("../app/utils/logger");

exports.getGothrams = async (userInput) => {
  try {
logger.info(`userinput ${userInput}`);
    const query = {
      text: 'SELECT gothram FROM profiles WHERE gothram ILIKE $1',
      values: [`%${userInput}%`],
    };
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    logger.error(`Error executing query ${error}`);
    throw error; // Re-throw the error after logging it
  }
};
