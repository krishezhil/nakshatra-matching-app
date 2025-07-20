const express = require("express");
const router = express.Router();
const profileController = require("../controller/ProfileController");
const isAuthenticated = require("../middleware/auth");

router.get("/", isAuthenticated, (req, res) => {
  // If you want to render an EJS view:
  // res.render('Matrimony');
  // If you want to serve a static HTML file:
  // res.sendFile(path.join(__dirname, '../../public/Matrimony.html'));
  res.render("Matrimony");
});

// Render update-profile page (no profile loaded)
router.get("/update-profile", (req, res) => {
  res.render("update-profile", { profile: null, searched: false });
});

router.get("/Matrimony", isAuthenticated, (req, res) => {
  res.render("Matrimony");
});

router.get("/Profile", isAuthenticated, (req, res) => {
  res.render("Profile");
});

router.get("/ListProfiles", isAuthenticated, (req, res) => {
  res.render("Showallprofile");
});

router.get('/search-profile', profileController.renderSearchProfile);
router.get('/searchProfileDetails', profileController.searchProfileByDetails);

module.exports = router;
