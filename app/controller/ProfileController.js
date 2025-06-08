const pool = require("../config/dbconfig").pool;
const Profile = require("../models/profile");

exports.getAge = (req, res, next) => {
  return new Promise((resolve, reject) => {
    const serialNo = req.query.serial_no;
    let matchigQuery;
    matchigQuery = ` select DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) as age from profiles where serial_no = '${serialNo}' `;
    console.log("Getting Age Query for given profile " + matchigQuery);
    pool
      .query(matchigQuery)
      .then((results) => {
        if (results.rows.length > 0) {
          const age = results.rows[0].age;
          console.log("Age:", age);
          resolve(age);
        } else {
          console.log("No age found for serial number:", serialNo);
          resolve(null); // or you can reject it if no age is found: reject(new Error("No age found for serial number"));
        }
      })
      .catch((error) => {
        console.error("Error while fetching age:", error);
        reject(error);
      });
  });
};

exports.findMatchingFemale = async (req, res, next) => {
  const gender = "Female";
  const serialNo = req.query.serial_no;
  const nakshId = req.query.nakshatraid;
  const includeMathimam = req.query.isMathimam;
  const reqGothram = req.query.gothram;
  const includeage = req.query.age;
  const includesiblings = req.query.siblings;
  const includeQualification = req.query.qualification;
  const includeMonSalary = req.query.monthsalary;
  const includeplace = req.query.place;
  const region = req.query.region;
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
  var searchNakshtraColumn = nakshatra[nakshId];
  let matchigQuery;
  let siblingsCondition = "";
  let qualificationCondition = "";
  let monthlyCondition = "";
  let addressCondition = "";
  let ageCondition = "";
  let regionCondition = "";
  const isRemarried = req.query.isRemarried;
  let remarriedCondition = "";

  console.log(
    "Find Matching Female Profile for given Male Nakshatra " + nakshId
  );
  if (includesiblings) {
    siblingsCondition = `and siblings = '${includesiblings}'`;
  }
  if (includeQualification) {
    qualificationCondition = `and qualification = '${includeQualification}'`;
  }
  if (includeMonSalary) {
    monthlyCondition = `and monthly_income >= '${includeMonSalary}'`;
  }
  if (includeplace) {
    addressCondition = `and LOWER(address) like '%' || LOWER('${includeplace}') || '%'`;
  }
  if (region) {
    regionCondition = `and LOWER(region) like '%' || LOWER('${region}') || '%'`;
  }

  if (isRemarried === "Y") {
    remarriedCondition = `and is_remarried = true`; //is_remarried
  } else {
    remarriedCondition = `and is_remarried = false`; //is_remarried
  }

  if (includeage) {
    ageCondition = `and DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) <= '${includeage}'`;
  } else if (!serialNo && !includeage) {
    ageCondition = `and DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) <= 50`;
  } else {
    // Call the getAge function and handle the promise
    // let boyAgeResponse = await getAge(req, res, next);
    await exports
      .getAge(req, res, next)
      .then((boyAgeResponse) => {
        // Extract the age from the response
        const boyAge = boyAgeResponse;
        ageCondition = `and DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) <= '${boyAge}'`; // FeMale age should be lesser than or equal to female by default
        console.log("Age condition:", ageCondition);
      })
      .catch((error) => {
        console.error("Error while getting age:", error);
        // Handle the error if necessary
      });
  }
  console.log("ageCondition before query prepare " + ageCondition);
  if (includeMathimam === "Y") {
    matchigQuery = `  select male_matching_uthamam.${searchNakshtraColumn} as uthamam_porutham, male_matching_mathimam.${searchNakshtraColumn} as mathimam_porutham, profiles.serial_no, profiles.name, profiles.father_name, profiles.mother_name, profiles.siblings, profiles.gothram, 
                      profiles.qualification, profiles.job_details,profiles.monthly_income, profiles.address, profiles.contact_no, profiles.gender, profiles.is_active , profiles.additional_contact_no, profiles.region
                      , profiles.qualification_details, profiles.birth_place
                      from profiles 
                      inner join male_matching_uthamam on male_matching_uthamam.nakshatra_no = profiles."nakshatraId"
                      inner join male_matching_mathimam on male_matching_mathimam.nakshatra_no = profiles."nakshatraId" 
                      where "nakshatraId" in (select nakshatra_no from male_matching_uthamam where ${searchNakshtraColumn} <> 0 
                      union all select nakshatra_no from male_matching_mathimam where ${searchNakshtraColumn} <> 0 ) 
                      and gender = '${gender}'  and gothram <> '${reqGothram}'
                      ${ageCondition}
                      ${siblingsCondition}
                      ${addressCondition}
                      ${qualificationCondition}
                      ${monthlyCondition}
                      ${regionCondition}
                      ${remarriedCondition}
                      and is_active = true
                      order by id `;
  } else {
    matchigQuery = `  select male_matching_uthamam.${searchNakshtraColumn} as uthamam_porutham, profiles.serial_no, profiles.name, profiles.father_name, profiles.mother_name, profiles.siblings, profiles.gothram, 
                      profiles.qualification, profiles.job_details,profiles.monthly_income, profiles.address, profiles.contact_no, profiles.gender, profiles.is_active , profiles.additional_contact_no, profiles.region, 
                      profiles.qualification_details, profiles.birth_place
                      from profiles 
                      inner join male_matching_uthamam on male_matching_uthamam.nakshatra_no = profiles."nakshatraId"
                      where "nakshatraId" in (select nakshatra_no from male_matching_uthamam where ${searchNakshtraColumn} <> 0 )
                      and gender = '${gender}' and gothram <> '${reqGothram}'
                      ${ageCondition}
                            ${siblingsCondition}
                              ${addressCondition}
                              ${qualificationCondition}
                              ${monthlyCondition}
                              ${regionCondition}
                              ${remarriedCondition}
                              and is_active = true
                      order by id `;
  }
  console.log("ageCondition after query prepare " + ageCondition);
  console.log("matching query male_matching - " + matchigQuery);

  pool.query(matchigQuery).then((results) => {
    const result = results.rows;
    //  console.log(result);
    const activeFilteredObj = JSON.stringify(
      result.filter((item) => item.is_active == true)
    );
    console.log("activeFilteredObj - " + activeFilteredObj);
    console.log("gothram Check " + reqGothram);

    res.send(JSON.parse(JSON.stringify(activeFilteredObj)));
  });
  //  .finally(() => pool.end()) -- TODO: Need to handle this
};

exports.findMatchingMale = async (req, res, next) => {
  const gender = "Male";
  const nakshId = req.query.nakshatraid;
  const includeMathimam = req.query.includeMathimam;
  const reqGothram = req.query.gothram;
  const includeage = req.query.age;
  const includesiblings = req.query.siblings;
  const includeQualification = req.query.qualification;
  const region = req.query.region;
  const includeMonSalary = req.query.monthsalary;
  const includeplace = req.query.place;
  console.log(
    "Find Matching Male Profile for given FeMale Nakshatra " + nakshId
  );
  // const nakshatra = Object.freeze({ 1: "one", 2: "two", 2: "three" });
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
  var searchNakshtraColumn = nakshatra[nakshId];
  console.log("search naksh column " + nakshatra[nakshId]);
  let matchigQuery;
  let siblingsCondition = "";
  let addressCondition = "";
  let qualificationCondition = "";
  let monthlyCondition = "";
  let ageCondition = "";
  let regionCondition = "";
  const isRemarried = req.query.isRemarried;
  let remarriedCondition = "";
  console.log("in profile controller isRemarried matching male " + isRemarried);

  if (includesiblings) {
    siblingsCondition = `and siblings = '${includesiblings}'`;
  }
  if (includeQualification) {
    qualificationCondition = `and qualification = '${includeQualification}'`;
  }
  if (includeMonSalary) {
    monthlyCondition = `and monthly_income >= '${includeMonSalary}'`;
  }

  if (includeplace) {
    addressCondition = `and LOWER(address) like '%' || LOWER('${includeplace}') || '%'`;
  }

  if (isRemarried === "Y") {
    remarriedCondition = `and is_remarried = true`; //is_remarried
  } else {
    remarriedCondition = `and is_remarried = false`; //is_remarried
  }

  if (region) {
    regionCondition = `and LOWER(region) like '%' || LOWER('${region}') || '%'`;
  }
  if (includeage) {
    ageCondition = `and DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) <= '${includeage}'`;
  } else {
    // Call the getAge function and handle the promise
    await exports
      .getAge(req, res, next)
      .then((boyAgeResponse) => {
        // Extract the age from the response
        const boyAge = boyAgeResponse;
        ageCondition = `and DATE_PART('YEAR', AGE(CURRENT_DATE, birth_date)) > '${boyAge}'`; // FeMale age should be lesser than or equal to female by default
        console.log(ageCondition);
      })
      .catch((error) => {
        console.error("Error while getting age:", error);
        // Handle the error if necessary
      });
  }

  if (includeMathimam === "Y") {
    matchigQuery = ` select female_matching_uthamam.${searchNakshtraColumn} as uthamam_porutham, female_matching_mathimam.${searchNakshtraColumn} as mathimam_porutham, profiles.serial_no, profiles.name, profiles.father_name, profiles.mother_name, profiles.siblings, profiles.gothram, 
                      profiles.qualification, profiles.job_details,profiles.monthly_income, profiles.address, profiles.contact_no, profiles.gender, profiles.is_active, profiles.additional_contact_no, profiles.region
                      , profiles.qualification_details , profiles.birth_place
                      from profiles 
                      inner join female_matching_uthamam on female_matching_uthamam.nakshatra_no = profiles."nakshatraId"
                      inner join female_matching_mathimam on female_matching_mathimam.nakshatra_no = profiles."nakshatraId" 
                      where "nakshatraId" in (select nakshatra_no from female_matching_uthamam where ${searchNakshtraColumn} <> 0 
                      union all select nakshatra_no from female_matching_mathimam where ${searchNakshtraColumn} <> 0 ) 
                      and gender = '${gender}' and gothram <> '${reqGothram}'
                      ${ageCondition}
                      ${siblingsCondition}
                      ${addressCondition}
                      ${qualificationCondition}
                      ${monthlyCondition}
                      ${regionCondition}
                      ${remarriedCondition}
                      and is_active = true
                      order by id `;
  } else {
    // matchigQuery = `select * from profiles WHERE "nakshatraId" in (select nakshatra_no from female_matching_uthamam where ${searchNakshtraColumn} <> 0) and gender = '${gender}' order by id`;
    //female_matching_mathimam.${searchNakshtraColumn} as mathimam_porutham,
    matchigQuery = ` select female_matching_uthamam.${searchNakshtraColumn} as uthamam_porutham, profiles.serial_no, profiles.name, profiles.father_name, profiles.mother_name, profiles.siblings, profiles.gothram, 
                      profiles.qualification, profiles.job_details,profiles.monthly_income, profiles.address, profiles.contact_no, profiles.gender, profiles.is_active, profiles.additional_contact_no, profiles.region 
                      , profiles.qualification_details , profiles.birth_place
                      from profiles 
                      inner join female_matching_uthamam on female_matching_uthamam.nakshatra_no = profiles."nakshatraId"
                      where "nakshatraId" in (select nakshatra_no from female_matching_uthamam where ${searchNakshtraColumn} <> 0 )
                      and gender = '${gender}' and gothram <> '${reqGothram}'
                      ${ageCondition}
                      ${siblingsCondition}
                      ${addressCondition}
                      ${qualificationCondition}
                      ${monthlyCondition}
                      ${regionCondition}
                      ${remarriedCondition}
                      and is_active = true
                      order by id `;
  }

  console.log("matchigQuery" + matchigQuery);
  pool.query(matchigQuery).then((results) => {
    const result = results.rows;
    //  let activeFilteredObj;
    //  let gothramFilteredObj;
    //  console.log(result);
    // IsActive Filter && Is Gothram Not Matching
    const activeFilteredObj = JSON.stringify(
      result.filter((item) => item.is_active == true)
    );
    console.log("activeFilteredObj - " + activeFilteredObj);
    res.send(JSON.parse(activeFilteredObj));
  });
  //  .finally(() => pool.end()) -- TODO: Need to handle this
};

exports.getMandatoryDetailsFromSerialNo = (req, res, next) => {
  const serialNo = req.query.serial_no;
  console.log("serial no " + serialNo);
  let matchigQuery;
  matchigQuery = ` select gothram, gender, "nakshatraId" as nakshatram from profiles where serial_no =  '${serialNo}' `;
  pool.query(matchigQuery).then((results) => {
    const result = results.rows;
    console.log("result" + result);
    res.send(result);
  });
};

exports.getDetailsFromSerialNo = (req, res, next) => {
  const serialNo = req.query.serial_no;
  console.log("serial no " + serialNo);
  let matchigQuery;
  matchigQuery = ` SELECT id,
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
  "nakshatraId" as nakshatraId,
  region,
  additional_contact_no,
  qualification_details,
  is_remarried
FROM profiles
WHERE serial_no = '${serialNo}' `;
  console.log(matchigQuery);
  pool.query(matchigQuery).then((results) => {
    const result = results.rows;
    console.log("result" + JSON.stringify(result));
    // console.log("result region" + result.region);
    res.send(result);
  });
};

exports.getGender = (req, res, next) => {
  const serialNo = req.query.serial_no;
  console.log("serial no " + serialNo);
  let matchigQuery;
  matchigQuery = ` select gender from profiles where serial_no = '${serialNo}' `;
  pool.query(matchigQuery).then((results) => {
    const result = results.rows;
    console.log("result" + result);
    res.send(result);
  });
};

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

exports.create = (req, res) => {
  // Create a Tutorial
  console.log("remarried " + req.body.is_remarried);
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
    nakshatraId: req.body.nakshatraId,
    region: req.body.region,
    additional_contact_no: req.body.additional_contact_no,
    qualification_details: req.body.qualification_details,
    is_active: true,
    is_remarried: req.body.is_remarried,
  };

  console.log("creating profile " + JSON.stringify(profile));

  // Save Tutorial in the database
  Profile.create(profile)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err.name);
      console.log(err.message);
      console.log(err.errors);
      res.status(500).send({
        message:
          err.errors ||
          err.message ||
          "Some error occurred while creating the Tutorial.",
      });
    });
};

exports.getHome = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').trim().split('=')[1]
  res.render("dashboard", {
    pageTitle: "Dashboard",
    path: "/",
    activeDashboard: true,
  });
};
