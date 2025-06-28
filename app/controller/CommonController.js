const pool = require("../config/dbconfig").pool;
const logger = require("../utils/logger");

/**
 * Get the age of a profile based on serial number.
 * @route GET /getAge
 * @param {Object} req - Express request object (expects req.query.serial_no)
 * @param {Object} res - Express response object
 */
exports.getAge = async (req, res) => {
  try {
    const serialNo = req.query.serial_no;
    const query = `SELECT DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) AS age FROM profiles WHERE serial_no = $1`;
    const results = await pool.query(query, [serialNo]);
    if (results.rows.length > 0) {
      const age = results.rows[0].age;
      logger.info(`Age: ${age}`);
      res.json({ age });
    } else {
      logger.info(`No age found for serial number: ${serialNo}`);
      res.status(404).json({ error: "No age found" });
    }
  } catch (error) {
    logger.error(`Error while fetching age:  ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get gothram suggestions based on user input.
 * @route GET /selectGothram
 * @param {Object} req - Express request object (expects req.query.input)
 * @param {Object} res - Express response object
 */
exports.getGothrams = async (req, res) => {
  try {
    const userInput = req.query.input;
    const query = {
      text: 'SELECT gothram FROM profiles WHERE gothram ILIKE $1',
      values: [`%${userInput}%`],
    };
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    logger.error(`Error fetching gothrams: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get all nakshatras for dropdown.
 * @route GET /dropdown
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getNakshatraDropdown = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM nakshatras');
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching dropdown options:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

