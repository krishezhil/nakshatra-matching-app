/**
 * Controller for handling profile-related operations.
 * Includes endpoints for searching, creating, and retrieving profiles,
 * as well as matching logic for matrimony.
 */
const pool = require("../config/dbconfig").pool;
const Profile = require("../models/profile");
const logger = require("../utils/logger");
const updateProfileService = require("../../services/updateProfileService");
const profileService = require("../../services/filterProfileService");

exports.searchProfile = async (req, res) => {
  const serialNumber = req.query.serialNumber;

  if (!serialNumber) {
    return res.render("update-profile", { profile: null, searched: true });
  }

  try {
    const dataRes = await updateProfileService.getProfileDetails(serialNumber);
    const profile = dataRes[0];

    if (profile) {
      logger.info(profile.region);
      res.render("update-profile", { profile, searched: true });
    } else {
      res.render("update-profile", { profile: null, searched: true });
    }
  } catch (error) {
    logger.error("Error fetching data:", error);
    res.render("update-profile", {
      profile: null,
      searched: true,
      error: "Internal Server Error",
    });
  }
};

exports.updateProfileById = async (req, res) => {
  const { valid, parsedId, error } = updateProfileService.validateId(
    req.params.id
  );
  if (!valid) {
    return res.status(400).send(error);
  }

  const { query, values } = updateProfileService.prepareUpdateQuery(
    req.body,
    parsedId
  );

  try {
    const updatedProfile = await updateProfileService.updateProfileInDatabase(
      query,
      values,
      parsedId
    );
    res.render("update-profile", {
      profile: updatedProfile,
      successMessage: "Profile updated successfully",
    });
  } catch (err) {
    logger.error("Error updating profile:", err);
    res.status(500).send("Error updating profile");
  }
};

exports.searchMatchingProfiles = async (req, res) => {
  try {
    // Prefer body, fallback to query
    const getParam = (key, defaultValue = "") =>
      req.body?.[key] ?? req.query?.[key] ?? defaultValue;

    const inputSerialNo = getParam("inputSerialNo");
    let inputGender = getParam("inputGender");
    let inputGothiram = getParam("inputGothiram");
    let nakshatraid = getParam("nakshatraid");
    let rasi_lagnam = getParam("rasi_lagnam");
    let navamsam_lagnam = getParam("navamsam_lagnam");

    const inputage = getParam("inputage", "35");
    const inputsiblings = getParam("inputsiblings");
    const inputplace = getParam("inputplace");
    const inputGraduation = getParam("inputGraduation");
    const inputMonSalary = getParam("inputMonSalary");
    const region = getParam("region");
    const isMathimam =
      getParam("isMathimam") === "Y" || getParam("isMathimam") === true;
    const isRemarried =
      getParam("isRemarried") === "Y" || getParam("isRemarried") === true;

    if (inputSerialNo) {
      const responseSearch = await profileService.getProfileDetails(
        inputSerialNo
      );
      logger.info(
        `Response from getProfileDetails: ${JSON.stringify(responseSearch)}`
      );

      const profileList = responseSearch?.data?.data;

      if (
        responseSearch.success &&
        Array.isArray(profileList) &&
        profileList.length > 0
      ) {
        const profile = profileList[0];
        inputGender = profile.gender;
        inputGothiram = profile.gothram;
        nakshatraid = profile.nakshatraid;
        rasi_lagnam = profile.rasi_lagnam || "";
        navamsam_lagnam = profile.navamsam_lagnam || "";
      } else {
        logger.info(`No profile found for serial number: ${inputSerialNo}`);
      }
    }

    logger.info("Final Matching Params:");
    logger.info("Gender: " + inputGender);
    logger.info("Gothram: " + inputGothiram);
    logger.info("Nakshatra: " + nakshatraid);
    logger.info("Rasi Lagnam: " + rasi_lagnam);
    logger.info("Navamsam Lagnam: " + navamsam_lagnam);
    logger.info("Age: " + inputage);
    logger.info("Siblings: " + inputsiblings);
    logger.info("Place: " + inputplace);
    logger.info("Qualification: " + inputGraduation);
    logger.info("Monthly Salary: " + inputMonSalary);
    logger.info("Region: " + region);
    logger.info("Is Mathimam: " + isMathimam);
    logger.info("Is Remarried: " + isRemarried);

    const queryParams = {
      nakshatraid,
      includeMathimam: isMathimam ? "Y" : "N",
      gothram: inputGothiram,
      age: inputage,
      siblings: inputsiblings,
      place: inputplace,
      serial_no: inputSerialNo,
      qualification: inputGraduation,
      monthsalary: inputMonSalary,
      region,
      isMathimam: isMathimam ? "Y" : "N",
      isRemarried: isRemarried ? "Y" : "N",
      rasi_lagnam,
      navamsam_lagnam,
    };

    logger.info(
      "Calling profileService.findMatchingProfiles with:",
      queryParams
    );

    const profiles = await profileService.findMatchingProfiles(
      queryParams,
      inputGender
    );

    logger.info("Profiles lentgh: " + profiles.length);
    req.session.profiles = profiles;

    //     req.session.profiles = {
    //   serial_no: inputSerialNo,
    //   data: profiles
    // };

    res.json({
      success: true,
      data: profiles,
      message:
        profiles.length === 0 ? "No matching profiles found" : "Profiles found",
    });
  } catch (error) {
    logger.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.renderShortlistedProfiles = (req, res) => {
  try {
    const profilesWrapper = req.session.profiles; // this is an object like { data: [...] }
    const profiles = profilesWrapper?.data || [];

    logger.info(
      `Session data in shortlistedprofiles: ${JSON.stringify(req.session)}`
    );
    logger.info(`First profile in session: ${JSON.stringify(profiles[0])}`);

    if (profiles.length > 0) {
      res.render("shortlistedprofiles", { profiles });
    } else {
      res.render("noDataFound");
    }
  } catch (error) {
    logger.error("Error rendering page:", error);
    res.status(500).send("Internal Server Error");
  }
};

// exports.renderShortlistedProfiles = (req, res) => {
//   try {
//     const profiles = req.session.profiles;
//     logger.info(`Session data in shortlistedprofiles: ${req.session}`);
//     logger.info(`Profiles in session: ${JSON.stringify(profiles.data[0])}`);

//     if (profiles && profiles.length > 0) {
//       res.render("shortlistedprofiles", { profiles });
//     } else {
//       res.render("noDataFound");
//     }
//   } catch (error) {
//     logger.error("Error rendering page:", error);
//     res.status(500).send("Internal Server Error");
//   }
// };

const nakshatra = Object.freeze({
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "one1",
  12: "one2",
  13: "one3",
  14: "one4",
  15: "one5",
  16: "one6",
  17: "one7",
  18: "one8",
  19: "one9",
  20: "twenty",
  21: "two1",
  22: "two2",
  23: "two3",
  24: "two4",
  25: "two5",
  26: "two6",
  27: "two7",
  28: "two8",
  29: "two9",
  30: "thirty",
  31: "three1",
  32: "three2",
  33: "three3",
  34: "three4",
  35: "three5",
  36: "three6",
});

/**
 * Find matching female profiles based on search criteria.
 * @route GET /findMatchingFemale
 * @param {Object} req - Express request object with query params
 * @param {Object} res - Express response object
 */
exports.findMatchingFemale = async (req, res, next) => {
  try {
    const gender = "Female";
    const serialNo = req.query.serial_no;
    const nakshId = parseInt(req.query.nakshatraid, 10);
    const includeMathimam = req.query.isMathimam;
    const reqGothram = req.query.gothram;
    const includeAge = req.query.age;
    const includeSiblings = req.query.siblings;
    const includeQualification = req.query.qualification;
    const includeMonSalary = req.query.monthsalary;
    const includePlace = req.query.place;
    const region = req.query.region;
    const isRemarried = req.query.isRemarried;
    const maleRasiLagnam = req.query.rasi_lagnam || "";
    const maleNavasamLagnam = req.query.navamsam_lagnam || "";
    logger.info(`Male Rasi Lagnam: ${maleRasiLagnam}`);
    logger.info(`Male Navasam Lagnam: ${maleNavasamLagnam}`);
    logger.info(`NakshId: ${nakshId}`);
    logger.debug(`Received query params: ${req.query}`);

    if (!nakshatra[nakshId]) {
      return res.status(400).json({ error: "Invalid nakshatra ID" });
    }
    const searchNakshtraColumn = nakshatra[nakshId];
    logger.info(`searchNakshtraColumn: ${searchNakshtraColumn}`);

    // Build dynamic WHERE conditions with params
    let conditions = [];
    let values = [];
    let paramIndex = 1;

    // Nakshatra condition - using subqueries
    // (You can keep this inline since it's complex, but parameters are mostly user inputs)
    const nakshatraCondition =
      includeMathimam === "Y"
        ? `nakshatraid IN (SELECT nakshatra_no FROM male_matching_uthamam WHERE ${searchNakshtraColumn} <> 0
          UNION ALL
          SELECT nakshatra_no FROM male_matching_mathimam WHERE ${searchNakshtraColumn} <> 0)`
        : `nakshatraid IN (SELECT nakshatra_no FROM male_matching_uthamam WHERE ${searchNakshtraColumn} <> 0)`;

    logger.info(`Searching for nakshatra: ${searchNakshtraColumn}`);
    logger.info(`${nakshId} Nakshatra Condition: ${nakshatraCondition}`);
    conditions.push(nakshatraCondition);

    // Gender condition
    conditions.push(`gender = $${paramIndex++}`);
    values.push(gender);

    // Gothram exclusion
    logger.info(`Request Gothram: ${reqGothram}`);
    if (reqGothram) {
      conditions.push(`gothram <> $${paramIndex++}`);
      values.push(reqGothram);
    }

    // Age condition
    let ageLimit;
    if (includeAge) {
      ageLimit = includeAge;
    } else if (!serialNo) {
      ageLimit = 50;
    } else {
      ageLimit = await exports.getAge(req);
      if (!ageLimit) {
        ageLimit = 50; // fallback default
      }
    }
    conditions.push(
      `DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) <= $${paramIndex++}`
    );
    logger.info(`Age Limit: ${ageLimit}`);
    values.push(ageLimit);

    // Siblings condition
    if (includeSiblings) {
      conditions.push(`siblings = $${paramIndex++}`);
      values.push(includeSiblings);
    }

    // Qualification condition
    if (includeQualification) {
      conditions.push(`qualification = $${paramIndex++}`);
      values.push(includeQualification);
    }

    // Monthly income condition
    if (includeMonSalary) {
      conditions.push(`monthly_income >= $${paramIndex++}`);
      values.push(includeMonSalary);
    }

    // Place condition (case-insensitive LIKE)
    if (includePlace) {
      conditions.push(
        `LOWER(address) LIKE '%' || LOWER($${paramIndex++}) || '%'`
      );
      values.push(includePlace);
    }

    // Region condition (case-insensitive LIKE)
    if (region) {
      conditions.push(
        `LOWER(region) LIKE '%' || LOWER($${paramIndex++}) || '%'`
      );
      values.push(region);
    }

    // Remarried condition
    if (isRemarried === "Y") {
      conditions.push(`is_remarried = true`);
    } else if (isRemarried === "N") {
      conditions.push(`is_remarried = false`);
    }
    // else no remarried condition

    // Active condition
    conditions.push(`is_active = true`);

    // Construct final WHERE clause
    const whereClause = conditions.length
      ? "WHERE " + conditions.join(" AND ")
      : "";

    // Construct the SELECT and JOIN parts based on includeMathimam
    let selectClause = `
      profiles.serial_no,
      profiles.name,
      profiles.father_name,
      profiles.mother_name,
      profiles.siblings,
      profiles.gothram,
      profiles.qualification,
      profiles.job_details,
      profiles.monthly_income,
      profiles.address,
      profiles.contact_no,
      profiles.gender,
      profiles.is_active,
      profiles.additional_contact_no,
      profiles.region,
      profiles.qualification_details,
      profiles.birth_place,
      profiles.rasi_lagnam,
      profiles.navamsam_lagnam
    `;

    let joinClause = `FROM profiles`;

    if (includeMathimam === "Y") {
      selectClause = `
        male_matching_uthamam.${searchNakshtraColumn} AS uthamam_porutham,
        male_matching_mathimam.${searchNakshtraColumn} AS mathimam_porutham,
        ${selectClause}
      `;

      joinClause += `
        INNER JOIN male_matching_uthamam ON male_matching_uthamam.nakshatra_no = profiles.nakshatraid
        INNER JOIN male_matching_mathimam ON male_matching_mathimam.nakshatra_no = profiles.nakshatraid
      `;
    } else {
      selectClause = `
        male_matching_uthamam.${searchNakshtraColumn} AS uthamam_porutham,
        ${selectClause}
      `;

      joinClause += `
        INNER JOIN male_matching_uthamam ON male_matching_uthamam.nakshatra_no = profiles.nakshatraid
      `;
    }

    const finalQuery = `
      SELECT ${selectClause}
      ${joinClause}
      ${whereClause}
      ORDER BY id
    `;

    logger.info(`Matching Female Query:, ${finalQuery}`);
    logger.info(`Values:  ${values}`);

    const results = await pool.query(finalQuery, values);
    logger.info(`Results: ${JSON.stringify(results.rows)}`);
    const filteredResults = results.rows.filter((item) => {
      if (!item.is_active) return false;

      const female_rasi_lagnam = item.rasi_lagnam || ""; // Replace with actual column name
      // const femaleD = item.navamsam_lagnam || ""; // Replace with actual column name

      logger.info(`Male Rasi Lagnam: ${maleRasiLagnam}`);
      // logger.info(`Male Navasam Lagnam: ${maleNavasamLagnam}`);
      logger.info(`Female Rasi Lagnam: ${female_rasi_lagnam}`);
      // logger.info(`Female D: ${femaleD}`);

      check = checkSingleCompatibility(maleRasiLagnam, female_rasi_lagnam);
      logger.info(`Compatibility Check: ${check}`);
      return check;
    });
    logger.info(`Filtered Results: ${JSON.stringify(filteredResults)}`);
    res.json(filteredResults);
  } catch (error) {
    logger.error(`Error in findMatchingFemale: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function checkSingleCompatibility(maleVal, femaleVal) {
  const toSet = (val) => new Set(val.split("/").map((v) => v.trim()));
  const isOnly = (set, val) => set.size === 1 && set.has(val);
  const intersects = (set1, set2) => [...set1].some((v) => set2.has(v));

  const riskItems = new Set(["Sani", "Sevai", "Kethu", "Raghu"]);

  const maleSet = toSet(maleVal);
  const femaleSet = toSet(femaleVal);

  // Rule 1: If male is only Suth, female must also be only Suth
  if (isOnly(maleSet, "Suth")) {
    return isOnly(femaleSet, "Suth");
  }

  // Rule 2: For risk items, female must have at least one of male's risk items
  const maleRisks = new Set([...maleSet].filter((item) => riskItems.has(item)));
  const femaleRisks = new Set(
    [...femaleSet].filter((item) => riskItems.has(item))
  );

  return intersects(maleRisks, femaleRisks);
}

function checkCompatibility(maleA, maleB, femaleC, femaleD) {
  const toSet = (val) => new Set(val.split("/").map((v) => v.trim()));

  const maleSet = new Set([...toSet(maleA), ...toSet(maleB)]);
  const femaleSet = new Set([...toSet(femaleC), ...toSet(femaleD)]);

  const isOnly = (set, val) => set.size === 1 && set.has(val);
  const intersects = (set1, set2) => [...set1].some((v) => set2.has(v));

  const riskItems = new Set(["Sani", "Sevai", "Kethu", "Raghu"]);

  // Rule 1: Suth-only check
  if (isOnly(maleSet, "Suth")) {
    const cOnlySuth = isOnly(toSet(femaleC), "Suth");
    const dOnlySuth = isOnly(toSet(femaleD), "Suth");
    if (!cOnlySuth || !dOnlySuth) {
      logger.info(
        "Mismatch: Male is only Suth, but female contains non-Suth value(s)."
      );
      return false;
    }
    return true;
  }

  // Rule 2: Risk item overlap
  const maleRisks = new Set([...maleSet].filter((item) => riskItems.has(item)));
  const femaleRisks = new Set(
    [...femaleSet].filter((item) => riskItems.has(item))
  );

  if (maleRisks.size === 0) {
    logger.info(
      "No risk items present in male side. Defaulting to false (unexpected case)."
    );
    return false;
  }

  if (!intersects(maleRisks, femaleRisks)) {
    logger.info("Mismatch: Female is missing matching risk item(s).");
    logger.info("Male risk items:", [...maleRisks].join(", "));
    logger.info("Female risk items:", [...femaleRisks].join(", "));
    return false;
  }

  return true;
}

/**
 * Find matching male profiles based on search criteria.
 * @route GET /findMatchingMale
 * @param {Object} req - Express request object with query params
 * @param {Object} res - Express response object
 */
exports.findMatchingMale = async (req, res, next) => {
  try {
    const gender = "Male";
    const nakshId = req.query.nakshatraid;
    const includeMathimam = req.query.includeMathimam === "Y";
    const reqGothram = req.query.gothram;
    const includesiblings = req.query.siblings;
    const includeQualification = req.query.qualification;
    const region = req.query.region;
    const includeMonSalary = req.query.monthsalary;
    const includeplace = req.query.place;
    const includeage = req.query.age;
    const isRemarried = req.query.isRemarried === "Y";
    const femaleRasiLagnam = req.query.rasi_lagnam || "";
    logger.info(`Female Rasi Lagnam: ${femaleRasiLagnam}`);
    logger.info(`NakshId: ${nakshId}`);
    logger.info(`Received query params: ${req.query}`);

    if (!nakshatra[nakshId]) {
      return res.status(400).json({ error: "Invalid nakshatra ID" });
    }

    const searchNakshtraColumn = nakshatra[nakshId];
    logger.info(`Searching for nakshatra column: ${searchNakshtraColumn}`);
    logger.info(`Request Gothram: ${reqGothram}`);
    logger.info(`Include Mathimam: ${includeMathimam}`);
    logger.info(`Include Age: ${includeage}`);
    logger.info(`Include Siblings: ${includesiblings}`);
    logger.info(`Include Qualification: ${includeQualification}`);
    logger.info(`Include Monthly Salary: ${includeMonSalary}`);
    logger.info(`Include Place: ${includeplace}`);

    const conditions = [`gender = $1`, `gothram <> $2`, `is_active = true`];
    const values = [gender, reqGothram];
    let paramIndex = values.length;

    if (includeage) {
      paramIndex++;
      conditions.push(
        `DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) <= $${paramIndex}`
      );
      values.push(includeage);
    } else {
      const femaleAge = await exports.getAge(req, res, next);
      paramIndex++;
      conditions.push(
        `DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) > $${paramIndex}`
      );
      values.push(femaleAge);
    }

    if (includesiblings) {
      paramIndex++;
      conditions.push(`siblings = $${paramIndex}`);
      values.push(includesiblings);
    }
    if (includeQualification) {
      paramIndex++;
      conditions.push(`qualification = $${paramIndex}`);
      values.push(includeQualification);
    }
    if (includeMonSalary) {
      paramIndex++;
      conditions.push(`monthly_income >= $${paramIndex}`);
      values.push(includeMonSalary);
    }
    if (includeplace) {
      paramIndex++;
      conditions.push(
        `LOWER(address) LIKE '%' || LOWER($${paramIndex}) || '%'`
      );
      values.push(includeplace);
    }
    if (region) {
      paramIndex++;
      conditions.push(`LOWER(region) LIKE '%' || LOWER($${paramIndex}) || '%'`);
      values.push(region);
    }
    if (isRemarried) {
      conditions.push(`is_remarried = true`);
    } else {
      conditions.push(`is_remarried = false`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const baseFields = `
      profiles.serial_no, profiles.name, profiles.father_name, profiles.mother_name, profiles.siblings, profiles.gothram, 
      profiles.qualification, profiles.job_details, profiles.monthly_income, profiles.address, profiles.contact_no, profiles.gender, 
      profiles.is_active, profiles.additional_contact_no, profiles.region, profiles.qualification_details, profiles.birth_place,profiles.rasi_lagnam
    `;

    let query = "";
    if (includeMathimam) {
      logger.info(
        `Searching for uthamam and mathimam nakshatra: ${searchNakshtraColumn}`
      );
      query = `
        SELECT
          female_matching_uthamam.${searchNakshtraColumn} AS uthamam_porutham,
          female_matching_mathimam.${searchNakshtraColumn} AS mathimam_porutham,
          ${baseFields}
        FROM profiles
        INNER JOIN female_matching_uthamam ON female_matching_uthamam.nakshatra_no = profiles.nakshatraid
        INNER JOIN female_matching_mathimam ON female_matching_mathimam.nakshatra_no = profiles.nakshatraid
        ${whereClause}
        AND profiles.nakshatraid IN (
          SELECT nakshatra_no FROM female_matching_uthamam WHERE ${searchNakshtraColumn} <> 0
          UNION ALL
          SELECT nakshatra_no FROM female_matching_mathimam WHERE ${searchNakshtraColumn} <> 0
        )
        ORDER BY profiles.id
      `;
    } else {
      logger.info(`Searching for uthamam nakshatra: ${searchNakshtraColumn}`);
      query = `
        SELECT
          female_matching_uthamam.${searchNakshtraColumn} AS uthamam_porutham,
          ${baseFields}
        FROM profiles
        INNER JOIN female_matching_uthamam ON female_matching_uthamam.nakshatra_no = profiles.nakshatraid
        ${whereClause}
        AND profiles.nakshatraid IN (
          SELECT nakshatra_no FROM female_matching_uthamam WHERE ${searchNakshtraColumn} <> 0
        )
        ORDER BY profiles.id
      `;
    }

    // ✅ Log the query and parameters
    logger.info(`Matching Male Query: ${query}`);
    logger.info(`With Parameters: ${values}`);

    const results = await pool.query(query, values);
    logger.info(`Results: ${JSON.stringify(results.rows)}`);
    const filteredResults = results.rows.filter((item) => {
      if (!item.is_active) return false;

      const male_rasi_lagnam = item.rasi_lagnam || ""; // Replace with actual column name
      // const femaleD = item.navamsam_lagnam || ""; // Replace with actual column name

      logger.info(`Male Rasi Lagnam: ${male_rasi_lagnam}`);
      // logger.info(`Male Navasam Lagnam: ${maleNavasamLagnam}`);
      logger.info(`Female Rasi Lagnam: ${femaleRasiLagnam}`);
      // logger.info(`Female D: ${femaleD}`);

      check = checkSingleCompatibility(femaleRasiLagnam, male_rasi_lagnam);
      logger.info(`Compatibility Check: ${check}`);
      return check;
    });
    logger.info(`Filtered Results: ${JSON.stringify(filteredResults)}`);

    res.json(filteredResults);
  } catch (error) {
    logger.error(`Error in findMatchingMale: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get mandatory profile details (gothram, gender, nakshatra) by serial number.
 * @route GET /getMandatoryProfileDetailsFromSerialNo
 * @param {Object} req - Express request object (expects req.query.serial_no)
 * @param {Object} res - Express response object
 */

exports.getMandatoryProfileDetailsFromSerialNo = async (req, res, next) => {
  const serialNo = req.query.serial_no;

  if (!serialNo) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameter: serial_no",
    });
  }

  logger.info(`Fetching mandatory profile details for serial_no: ${serialNo}`);

  const query = `
    SELECT 
      gothram, 
      gender, 
      nakshatraid,
      rasi_lagnam,
      navamsam_lagnam 
    FROM profiles 
    WHERE serial_no = $1
  `;

  try {
    const results = await pool.query(query, [serialNo]);
    const data = results.rows;

    if (data.length === 0) {
      logger.info(`No profile found with serial_no: ${serialNo}`);
      return res.status(200).json({
        success: true,
        data: [],
        message: "No profile found",
      });
    }

    logger.info(`Mandatory profile details: ${JSON.stringify(data)}`);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error(`Error fetching mandatory profile details: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get full profile details by serial number.
 * @route GET /getProfileDetailsFromSerialNo
 * @param {Object} req - Express request object (expects req.query.serial_no)
 * @param {Object} res - Express response object
 */
exports.getProfileDetailsFromSerialNo = async (req, res, next) => {
  const serialNo = req.query.serial_no;

  if (!serialNo) {
    return res
      .status(400)
      .send({ message: "Missing required parameter: serial_no" });
  }

  logger.info(`Fetching full profile for serial_no: ${serialNo}`);

  const query = `
    SELECT 
      id,
      serial_no,
      name,
      CAST(birth_date AS TIMESTAMP) AT TIME ZONE 'UTC' AS birth_date,
      father_name,
      mother_name,
      siblings,
      gothram,
      birth_time,
      birth_place,
      qualification,
      job_details,
      monthly_income,
      address,
      contact_no,
      gender,
      is_active,
      nakshatraid,
      region,
      additional_contact_no,
      qualification_details,
      is_remarried,
      rasi_lagnam,
      navamsam_lagnam
    FROM profiles
    WHERE serial_no = $1
  `;

  try {
    const results = await pool.query(query, [serialNo]);
    const data = results.rows;

    if (data.length === 0) {
      logger.info(`No profile found with serial_no: ${serialNo}`);
      return res.status(404).send({ message: "Profile not found" });
    }

    logger.info(`Profile details:  ${JSON.stringify(data)}`);
    res.send(data);
  } catch (error) {
    logger.error(`Error fetching profile details in Controller: ${error}`);
    res.status(500).send({ message: "Internal server error" });
  }
};

/**
 * Get profile(s) by multiple search criteria.
 * @route GET /getProfileByDetails
 * @param {Object} req - Express request object (expects req.query with any of: serial_no, name, gender, birth_date, contact_no)
 * @param {Object} res - Express response object
 */
exports.getProfileByDetails = async (req, res, next) => {
  try {
    // Collect possible search fields from query
    const { serial_no, name, gender, birth_date, contact_no } = req.query;

    // Build dynamic WHERE clause
    let conditions = [];
    let values = [];
    let idx = 1;

    if (serial_no) {
      conditions.push(`serial_no = $${idx++}`);
      values.push(serial_no);
    }
    if (name) {
      conditions.push(`LOWER(name) LIKE LOWER($${idx++})`);
      values.push(`%${name}%`);
    }
    if (gender) {
      conditions.push(`gender = $${idx++}`);
      values.push(gender);
    }
    if (birth_date) {
      conditions.push(`CAST(birth_date AS DATE) = $${idx++}`);
      values.push(birth_date);
    }
    if (contact_no) {
      conditions.push(`contact_no = $${idx++}`);
      values.push(contact_no);
    }

    if (conditions.length === 0) {
      return res
        .status(400)
        .send({ message: "At least one search parameter is required." });
    }

    const whereClause = "WHERE " + conditions.join(" AND ");

    const query = `
      SELECT 
        id,
        serial_no,
        name,
        CAST(birth_date AS DATE) AS birth_date,
        father_name,
        mother_name,
        siblings,
        gothram,
        birth_time,
        birth_place,
        qualification,
        job_details,
        monthly_income,
        address,
        contact_no,
        gender,
        is_active,
        nakshatraid,
        region,
        additional_contact_no,
        qualification_details,
        is_remarried,
        rasi_lagnam,
        navamsam_lagnam
      FROM profiles
      ${whereClause}
    `;

    logger.info(`Profile search query: ${query}`);
    logger.info(`With values: ${JSON.stringify(values)}`);

    const results = await pool.query(query, values);
    const data = results.rows;

    if (data.length === 0) {
      logger.info(`No profiles found for given criteria`);
      return res.status(404).send({ message: "No profiles found" });
    }

    logger.info(`Profiles found: ${JSON.stringify(data)}`);
    res.send(data);
  } catch (error) {
    logger.error(`Error fetching profiles by details: ${error}`);
    res.status(500).send({ message: "Internal server error" });
  }
};

/**
 * Get all profiles.
 * @route GET /findAll
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findAll = (req, res) => {
  Profile.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

/**
 * Filter profiles by name.
 * @route GET /filter
 * @param {Object} req - Express request object (expects req.query.name)
 * @param {Object} res - Express response object
 */
exports.filter = (req, res) => {
  Profile.findAll({
    where: {
      name: req.query.name,
    },
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

/**
 * Create a new profile.
 * @route POST /create
 * @param {Object} req - Express request object (expects req.body with profile fields)
 * @param {Object} res - Express response object
 */
exports.create = (req, res) => {
  // Create a Tutorial
  logger.info(`remarried ${req.body.is_remarried}`);
  logger.info(`rasi_lagnam ${req.body.rasi_lagnam}`);
  logger.info(`navamsam_lagnam ${req.body.navamsam_lagnam}`);
  logger.info(`nakshatraid ${req.body.nakshatraid}`);
  const profile = {
    serial_no: req.body.serial_no,
    name: req.body.name,
    father_name: req.body.father_name,
    mother_name: req.body.mother_name,
    siblings: req.body.siblings,
    gothram: req.body.gothram,
    birth_date: req.body.birth_date,
    birth_time: req.body.birth_time,
    birth_place: req.body.birth_place,
    qualification: req.body.qualification,
    job_details: req.body.job_details,
    monthly_income: req.body.monthly_income,
    address: req.body.address,
    contact_no: req.body.contact_no,
    gender: req.body.gender,
    nakshatraid: req.body.nakshatraid,
    region: req.body.region,
    additional_contact_no: req.body.additional_contact_no,
    qualification_details: req.body.qualification_details,
    is_active: true,
    is_remarried: req.body.is_remarried,
    rasi_lagnam: req.body.rasi_lagnam,
    navamsam_lagnam: req.body.navamsam_lagnam,
  };

  logger.info(`creating profile  ${JSON.stringify(profile)}`);

  // Save Tutorial in the database
  Profile.create(profile)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      logger.info(err.name);
      logger.info(err.message);
      logger.info(err.errors);
      res.status(500).send({
        message:
          err.errors ||
          err.message ||
          "Some error occurred while creating the Tutorial.",
      });
    });
};

exports.updateProfile = async (req, res) => {
  const serialNumber = req.body.serialNumber;

  if (!serialNumber) {
    return res.render("update-profile", { profile: null, searched: true });
  }

  try {
    // Use your internal getProfileDetailsFromSerialNo logic here
    const dataRes = await exports.getProfileDetailsFromSerialNo(serialNumber);
    const profile = dataRes[0];

    if (profile) {
      logger.info(profile.region);
      res.render("update-profile", { profile, searched: true });
    } else {
      res.render("update-profile", { profile: null, searched: true });
    }
  } catch (error) {
    logger.error("Error fetching data:", error);
    res.render("update-profile", {
      profile: null,
      searched: true,
      error: "Internal Server Error",
    });
  }
};

exports.renderSearchProfile = (req, res) => {
  res.render("search-profile", { profiles : [], searched: false });
};

// exports.searchProfileByDetails = async (req, res) => {
//   // Read all search criteria from query parameters
//   const { serialNumber, name, gender, dob, contactNo } = req.query;

//   // Build a search object
//   const searchCriteria = {
//     serial_no: serialNumber,
//     name,
//     gender,
//     birth_date: dob,
//     contact_no: contactNo
//   };

//   try {
//     // Call a service method that accepts multiple criteria
//     // You need to implement this in your updateProfileService or a new service
//     const dataRes = await updateProfileService.getProfileByDetails(searchCriteria);
//     const profile = dataRes[0];
//     res.render('search-profile', { profile, searched: true });
//   } catch (error) {
//     logger.error("Error fetching data:", error);
//     res.render('search-profile', { profile: null, searched: true, error: 'Internal Server Error' });
//   }
// };

exports.searchProfileByDetails = async (req, res) => {
  const { serialNumber, name, gender, dob, contactNo } = req.query;

  // Build dynamic WHERE clause and values
  let conditions = [];
  let values = [];
  let idx = 1;

  if (serialNumber) {
    conditions.push(`serial_no = $${idx++}`);
    values.push(serialNumber);
  }
  if (name) {
    conditions.push(`LOWER(name) LIKE LOWER($${idx++})`);
    values.push(`%${name}%`);
  }
  if (gender) {
    conditions.push(`gender = $${idx++}`);
    values.push(gender);
  }
  if (dob) {
    conditions.push(`CAST(birth_date AS DATE) = $${idx++}`);
    values.push(dob);
  }
  if (contactNo) {
    conditions.push(`contact_no = $${idx++}`);
    values.push(contactNo);
  }

  if (conditions.length === 0) {
    return res.render("search-profile", {
      profiles: [],
      searched: true,
      error: "Please enter at least one search criteria.",
    });
  }

  const whereClause = "WHERE " + conditions.join(" AND ");
  const query = `
    SELECT 
      id,
      serial_no,
      name,
      CAST(birth_date AS DATE) AS birth_date,
      father_name,
      mother_name,
      siblings,
      gothram,
      birth_time,
      birth_place,
      qualification,
      job_details,
      monthly_income,
      address,
      contact_no,
      gender,
      is_active,
      nakshatraid,
      region,
      additional_contact_no,
      qualification_details,
      is_remarried,
      rasi_lagnam,
      navamsam_lagnam
    FROM profiles
    ${whereClause}
  `;

  try {
    const results = await pool.query(query, values);
    // const profile = results.rows[0] || null;
    res.render("search-profile", {
      profiles: results.rows || [],
      searched: true,
    });
  } catch (error) {
    logger.error("Error fetching data:", error);
    res.render("search-profile", {
      profiles: [],
      searched: true,
      error: "Internal Server Error",
    });
  }
};
