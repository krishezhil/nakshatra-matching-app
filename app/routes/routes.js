const express = require("express");
const profileController = require("../controller/ProfileController");
const isAuthenticated = require("../middleware/auth"); // Import the authentication middleware


const router = express.Router();

router.get("/profile", profileController.findAll);
router.post("/profile", profileController.create);
router.get("/findMatchingMale", profileController.findMatchingMale);
router.get("/findMatchingFemale", profileController.findMatchingFemale);
router.get(
  "/getSearchDetails",
  profileController.getMandatoryProfileDetailsFromSerialNo
);
router.get(
  "/getProfileFromSerialNo",
  profileController.getProfileDetailsFromSerialNo
);

router.get("/searchProfile", profileController.searchProfile);
router.post("/update-profile/:id", profileController.updateProfileById);
router.post(
  "/searchMatchingProfiles",
  isAuthenticated,
  profileController.searchMatchingProfiles
);
router.get(
  "/shortlistedprofiles",
  isAuthenticated,
  profileController.renderShortlistedProfiles
);




// Fetch profile details route
router.get("/fetch-profile/:profileId", (req, res) => {
  const profileId = req.params.profileId;
  const profile = {}; // Fetch the profile from the database
  res.json(profile); // Send the fetched profile details as JSON response
});

module.exports = router;
