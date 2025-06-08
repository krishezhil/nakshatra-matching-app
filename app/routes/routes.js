const express = require('express')
const profileController = require('../controller/ProfileController')

const router = express.Router()

router.get('/profile', profileController.findAll)
router.post('/profile', profileController.create)
router.get('/findMatchingMale', profileController.findMatchingMale)
router.get('/findMatchingFemale', profileController.findMatchingFemale)
router.get('/getAge', profileController.getAge)
router.get('/getGender', profileController.getGender)
router.get('/getSearchDetails', profileController.getMandatoryDetailsFromSerialNo)
router.get('/getAllDetails', profileController.getDetailsFromSerialNo)

// router.get('/select', profileController.select)
// router.get('/filter', profileController.filter)

// Fetch profile details route
router.get('/fetch-profile/:profileId', (req, res) => {
    const profileId = req.params.profileId;
    // Fetch profile details from the database based on the profileId
    // Example code to fetch profile details goes here
    const profile = {}; // Fetch the profile from the database
    res.json(profile); // Send the fetched profile details as JSON response
  });
  
  // Update profile route
  router.post('/update-profile', (req, res) => {
    const updatedProfileData = req.body;
    // Update the profile in the database with the provided updatedProfileData
    // Example code to update profile details goes here
    res.json({ message: 'Profile updated successfully' }); // Send success response
  });
module.exports = router
