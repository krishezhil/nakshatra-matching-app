// services/pdfService.js
const puppeteer = require('puppeteer');
const logger = require("../app/utils/logger");

exports.generatePDF = async (profilesData) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  logger.info("Generating PDF with Puppeteer...");
  if (!profilesData || profilesData.length === 0) {
    logger.warn("No profiles data provided for PDF generation.");
    return Buffer.from(''); // Return empty buffer if no data
  }
  logger.info(`Profiles data length: ${profilesData.length}`);
  // Log the first profile for debugging
  logger.info(`First profile data: ${JSON.stringify(profilesData[0])}`);

  // Construct HTML content dynamically based on profiles data
  let htmlContent = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Profiles</title></head><body>';
  
  profilesData.forEach(profile => {
    htmlContent += `<div><h3>${profile.name}</h3><p><b>Serial Number:</b> ${profile.serial_no}</p>`;
    htmlContent += `<p><b>Uthama Porutham (Out Of 10):</b> ${profile.uthamam_porutham}</p>`;
    htmlContent += `<p><b>Mathima Porutham (Out Of 10):</b> ${profile.mathimam_porutham}</p>`;
    htmlContent += `<p><b>Father Name:</b> ${profile.father_name}</p></div>`;
    // htmlContent += `<p><b>Mother Name:</b> ${profile.mother_name}</p></div>`;
    // htmlContent += `<p><b>Siblings:</b> ${profile.siblings}</p></div>`;
    htmlContent += `<p><b>Contact Number:</b> ${profile.contact_no}</p></div>`;
    // htmlContent += `<p><b>Alternate Contact Number:</b> ${profile.additional_contact_no}</p></div>`;
    // htmlContent += `<p><b>Address:</b> ${profile.address}</p></div>`;
    // htmlContent += `<p><b>Gothram:</b> ${profile.gothram}</p></div>`;
    // htmlContent += `<p><b>Graduation:</b> ${profile.qualification}</p></div>`;
    // htmlContent += `<p><b>Qualification Details:</b> ${profile.qualification_details}</p></div>`;
    // htmlContent += `<p><b>Job:</b> ${profile.job_details}</p></div>`;
    // htmlContent += `<p><b>Salary:</b> ${profile.monthly_income}</p></div>`;
    // htmlContent += `<p><b>Region:</b> ${profile.region}</p></div>`;
  });
  htmlContent += '</body></html>';

  // Generate PDF from HTML content
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  // Apply CSS styling for borders
  await page.addStyleTag({ content: `
    .profile-card {
      border: 2px solid #555;
      padding: 10px;
      margin-bottom: 20px;
    }
  ` });
  
  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdfBuffer;
};
