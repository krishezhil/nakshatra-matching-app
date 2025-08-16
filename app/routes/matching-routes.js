const express = require('express')
const profileController = require('../controller/ProfileController')

const router = express.Router()

router.get('/profile', profileController.findAll)
router.post('/Create-profile', profileController.create)
router.post('/findMatchingMale', profileController.findMatchingMale)
router.get('/findMatchingFemale', profileController.findMatchingFemale)

module.exports = router
