const express = require('express');
const router = express.Router();
const excelService = require('../../services/generate-excel');
const pdfService = require('../../services/generate-pdf');
const logger = require('../utils/logger');

// /generate-excel route
router.get('/generate-excel', async (req, res) => {
  try {
    // const profilesData = req.session.profiles;
    const profilesWrapper = req.session.profiles;
    const profilesData = profilesWrapper?.data || [];

    if (!profilesData || !Array.isArray(profilesData) || profilesData.length === 0) {
      return res.status(400).json({ error: 'No profiles data available for export. Please search and shortlist profiles first.' });
    }
    const excelBuffer = await excelService.generateExcel(profilesData);

    res.setHeader('Content-Disposition', 'attachment; filename=profiles.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (err) {
    logger.error('Error generating Excel:', err);
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

// Route to serve generated PDF file
router.get('/download-pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../profiles.pdf');
  res.sendFile(filePath);
});

router.get('/generate-pdf', async (req, res) => {
  try {
    const profilesWrapper = req.session.profiles;
    const profilesData = profilesWrapper?.data || [];
    const serialNo = profilesWrapper?.serial_no || 'profile';
    // const profilesData = req.session.profiles;
    const pdfBuffer = await pdfService.generatePDF(profilesData);
    const filename = `${serialNo}_matching_profiles.pdf`;

    res.setHeader(`Content-Disposition', 'attachment; filename=${filename}'`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    logger.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;