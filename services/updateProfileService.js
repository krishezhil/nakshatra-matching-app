// services/profileService.js
// const fetch = require('node-fetch');
const pool = require('../app/config/dbconfig').pool;
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL; // Ensure your .env file has API_BASE_URL defined

exports.getProfileDetails = async (serialNo) => {
  try {
    const url = `${API_BASE_URL}getAllDetails?serial_no=${serialNo}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching profile details: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error('No profile data found');
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile details:', error);
    throw error;
  }
};

exports.validateId = function validateId(id) {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return { valid: false, error: 'Invalid ID' };
    }
    return { valid: true, parsedId };
  }
  
  exports.prepareUpdateQuery = function prepareUpdateQuery(data, id) {
    const {
      name, fatherName, motherName, siblings, gothram, birthDate, birthTime, birthPlace,
      jobDetails, monthlyIncome, address, contactNo, isActive, gender, region, Natchathiram,
      qualification_details, graduation, additional_contact_no,isRemarried,
    } = data;
    console.log('region value before updating db '+data.region)
    const query = `
      UPDATE profiles
      SET name = $1, father_name = $2, mother_name = $3, siblings = $4, gothram = $5, birth_date = $6,
      birth_time = $7, birth_place = $8, job_details = $9, monthly_income = $10, address = $11,
      contact_no = $12, is_active = $13, gender = $14, region = $15, "nakshatraId" = $16,
      qualification_details = $17, qualification = $18, additional_contact_no = $19, is_remarried = $20
      WHERE id = $21
    `;
    const values = [name, fatherName, motherName, siblings, gothram, birthDate, birthTime, birthPlace, jobDetails, monthlyIncome, address, contactNo, isActive, gender, region, Natchathiram, qualification_details, graduation, additional_contact_no,isRemarried, id];
  
    return { query, values };
  }
  
 exports.updateProfileInDatabase = async function updateProfileInDatabase(query, values, id) {
    await pool.query(query, values);
    const updatedProfile = await pool.query(`
      SELECT id, serial_no, name, TO_CHAR(CAST(birth_date AS TIMESTAMP) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS birth_date,
      father_name, mother_name, siblings, gothram, birth_time, birth_place, qualification, job_details, monthly_income,
      address, contact_no, gender, is_active, "nakshatraId" AS nakshatraId, region, additional_contact_no,
      qualification_details,is_remarried
      FROM profiles WHERE id = $1
    `, [id]);
  
    return updatedProfile.rows[0];
  }
  
// exports = {
//     validateId,
//     prepareUpdateQuery,
//     updateProfileInDatabase
//   };

