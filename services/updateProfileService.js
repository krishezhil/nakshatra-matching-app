// services/profileService.js
// const fetch = require('node-fetch');
const pool = require('../app/config/dbconfig').pool;
const { log } = require('winston');
const logger = require("../app/utils/logger");
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL; // Ensure your .env file has API_BASE_URL defined

exports.getProfileByDetails = async (criteria) => {
  try {
    // Build query string from criteria object
    const params = new URLSearchParams();
    if (criteria.serial_no) params.append('serial_no', criteria.serial_no);
    if (criteria.name) params.append('name', criteria.name);
    if (criteria.gender) params.append('gender', criteria.gender);
    if (criteria.birth_date) params.append('birth_date', criteria.birth_date);
    if (criteria.contact_no) params.append('contact_no', criteria.contact_no);

    const url = `${API_BASE_URL}getProfileByDetails?${params.toString()}`;
    logger.info(`Fetching profile details from URL: ${url}`);
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
    logger.error(`Error fetching profile details: ${error.message}`);
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
      jobDetails, monthlyIncome, address, contactNo, isActive, gender, region, nakshatraid,
      qualification_details, graduation, additional_contact_no,isRemarried,rasiLagnam, navamsamLagnam, 
    } = data;
    logger.info(`region value before updating db  ${data.region}`)
    logger.info(`rasiLagnam value before updating db  ${data.rasiLagnam}`)
    logger.info(`navamsamLagnam value before updating db  ${data.navamsamLagnam}`)
    const query = `
      UPDATE profiles
      SET name = $1, father_name = $2, mother_name = $3, siblings = $4, gothram = $5, birth_date = $6,
      birth_time = $7, birth_place = $8, job_details = $9, monthly_income = $10, address = $11,
      contact_no = $12, is_active = $13, gender = $14, region = $15, nakshatraid = $16,
      qualification_details = $17, qualification = $18, additional_contact_no = $19, is_remarried = $20,rasi_lagnam = $21, navamsam_lagnam = $22
      WHERE id = $23
    `;
    const values = [name, fatherName, motherName, siblings, gothram, birthDate, birthTime, birthPlace, jobDetails, 
      monthlyIncome, address, contactNo, isActive, gender, region, nakshatraid, qualification_details, graduation, additional_contact_no,
      isRemarried,rasiLagnam,navamsamLagnam, id];
    logger.info(`Prepared update query: ${query} with values: ${values}`);
    logger.info(`Prepared update query for id: ${id}`);
  
    return { query, values };
  }
  
 exports.updateProfileInDatabase = async function updateProfileInDatabase(query, values, id) {
    await pool.query(query, values);
    const updatedProfile = await pool.query(`
      SELECT id, serial_no, name, TO_CHAR(CAST(birth_date AS TIMESTAMP) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS birth_date,
      father_name, mother_name, siblings, gothram, birth_time, birth_place, qualification, job_details, monthly_income,
      address, contact_no, gender, is_active, nakshatraid, region, additional_contact_no,
      qualification_details,is_remarried,rasi_lagnam,navamsam_lagnam
      FROM profiles WHERE id = $1
    `, [id]);
  
    return updatedProfile.rows[0];
  }
  
// exports = {
//     validateId,
//     prepareUpdateQuery,
//     updateProfileInDatabase
//   };

