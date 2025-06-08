// services/gothramService.js
// const pool = require('../db'); // Adjust the path to your database connection file
const pool = require('../app/config/dbconfig').pool;


exports.getGothrams = async (userInput) => {
  try {
    console.log('userinput '+userInput);
    const query = {
      text: 'SELECT gothram FROM profiles WHERE gothram ILIKE $1',
      values: [`%${userInput}%`],
    };
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error executing query', error);
    throw error; // Re-throw the error after logging it
  }
};
