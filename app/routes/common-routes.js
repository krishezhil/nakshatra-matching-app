const express = require('express');
const router = express.Router();
const commonController = require('../controller/CommonController');

router.get('/getAge', commonController.getAge);
router.get('/fetchAvailableGothrams', commonController.getGothrams);
router.get('/dropdown', commonController.getNakshatraDropdown);



module.exports = router;