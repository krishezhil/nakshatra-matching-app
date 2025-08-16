const express = require("express");
const router = express.Router();
const profileController = require("../controller/ProfileController");
const isAuthenticated = require("../middleware/auth");

router.get("/", isAuthenticated, (req, res) => {
  // If you want to render an EJS view:
  // res.render('Matrimony');
  // If you want to serve a static HTML file:
  // res.sendFile(path.join(__dirname, '../../public/Matrimony.html'));
  res.render("find-matching");
});

// Render update-profile page (no profile loaded)
router.get("/update-profile", (req, res) => {
  res.render("update-profile", { profile: null, searched: false });
});

router.get("/Find-Matching", isAuthenticated, (req, res) => {
  res.render("find-matching");
});

router.get("/Create-Profile", isAuthenticated, (req, res) => {
  res.render("create-profile");
});

router.get("/ListProfiles", isAuthenticated, (req, res) => {
  res.render("Showallprofile");
});

router.get('/search-profile', profileController.renderSearchProfile);
router.get('/searchProfileDetails', profileController.searchProfileByDetails);
router.get('/getAge', profileController.getAge);

module.exports = router;
