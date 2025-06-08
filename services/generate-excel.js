const ExcelJS = require('exceljs');

exports.generateExcel = async (profilesData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Profiles');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Serial Number', key: 'serial_no', width: 15 },
    { header: 'Uthama Porutham (Out Of 10)', key: 'uthamam_porutham', width: 15 },
    { header: 'Mathima Porutham (Out Of 10)', key: 'mathimam_porutham', width: 15 },
    // { header: 'Father Name', key: 'father_name', width: 20 },
    // { header: 'Mother Name', key: 'mother_name', width: 20 },
    // { header: 'Siblings', key: 'siblings', width: 15 },
    { header: 'Contact Number', key: 'contact_no', width: 15 },
    // { header: 'Alternate Contact Number', key: 'additional_contact_no', width: 15 },
    // { header: 'Address', key: 'address', width: 30 },
    // { header: 'Gothram', key: 'gothram', width: 20 },
    // { header: 'Graduation', key: 'qualification', width: 20 },
    // { header: 'Qualification Details', key: 'qualification_details', width: 20 },
    // { header: 'Job', key: 'job_details', width: 20 },
    // { header: 'Salary', key: 'monthly_income', width: 15 },
    // { header: 'Region', key: 'region', width: 15 }
  ];

  profilesData.forEach(profile => {
    worksheet.addRow({
      name: profile.name,
      serial_no: profile.serial_no,
      uthamam_porutham: profile.uthamam_porutham,
      mathimam_porutham: profile.mathimam_porutham,
      father_name: profile.father_name,
      mother_name: profile.mother_name,
      siblings: profile.siblings,
      contact_no: profile.contact_no,
      additional_contact_no: profile.additional_contact_no,
      address: profile.address,
      gothram: profile.gothram,
      qualification: profile.qualification,
      qualification_details: profile.qualification_details,
      job_details: profile.job_details,
      monthly_income: profile.monthly_income,
      region: profile.region
    });
  });

  const excelBuffer = await workbook.xlsx.writeBuffer();
  return excelBuffer;
};