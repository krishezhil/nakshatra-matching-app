const pool = require("../config/dbconfig").pool;
const logger = require("../utils/logger");



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

