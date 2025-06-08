const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');
const matchRoute = require('./app/routes/routes');
const profileRoutes = require('./app/routes/profileroutes'); 
const pool = require('./app/config/dbconfig').pool;
const session = require('express-session');
const excelService = require('./services/generate-excel');
const pdfService  = require('./services/generate-pdf');
const dataService = require('./services/fillDataService');
const gothramService = require('./services/gothramService');
const profileService = require ('./services/filterProfileService');
const updateProfileService = require ('./services/updateProfileService');
const logger = require('./app/utils/logger');

const app = express();
const PORT = 3000;

var corsOptions = {
  origin: "http://localhost:3001"
};

// Sample user data (in a real-world app, this would be stored in a database)
const users = [
  { username: 'user1', password: 'password1' },
  { username: 'admin', password: 'admin' },
  { username: 'a', password: 'a' }
];
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/profiles', profileRoutes);

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static('public', {
  setHeaders: (res, path, stat) => {
      if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
      }
  }
}));
app.use('/api', matchRoute);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Login endpoint
app.use(session({
  secret: 'AES12355645889008876432', // Change this to a secure random string
  resave: false,
  saveUninitialized: true
}));

app.get('/dropdown', async (req, res) => {
  try {
    const result = await pool.query('select id,name from nakshatras');
    const options = result.rows;
    res.json(options);
  } catch (error) {
    logger.error('Error fetching dropdown options:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML form page
app.get('/',isAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/Matrimony');
});

app.get('/generate-excel', async (req, res) => {
  try {
    const profilesData = req.session.profiles;
    const excelBuffer = await excelService.generateExcel(profilesData);

    res.setHeader('Content-Disposition', 'attachment; filename=profiles.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);
  } catch (err) {
    logger.error('Error generating Excel:', err);
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

app.get('/generate-pdf', async (req, res) => {
  try {
    const profilesData = req.session.profiles;
    const pdfBuffer = await pdfService.generatePDF(profilesData);

    res.setHeader('Content-Disposition', 'attachment; filename=profiles.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    logger.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Define route to serve generated PDF file
app.get('/download-pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'profiles.pdf');
  res.sendFile(filePath);
});


app.post('/filldata', isAuthenticated, async (req, res) => {
  try {
    const { inputSerialNo } = req.body;

    if (inputSerialNo) {
      const processedData = await dataService.fetchProfileData(inputSerialNo);

      // Assuming you need to log each of the properties
      processedData.forEach(data => {
        // console.log("Value 1:", data.gender);
        // console.log("Value 2:", data.gothram);
        // console.log("Value 3:", data.nakshatram);
      });

      res.json(processedData);
    } else {
      res.status(400).json({ error: 'inputSerialNo is required' });
    }
  } catch (error) {
    logger.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Initialize profilessearch as an empty array
// let profilessearch = [];

// Middleware
// app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/update-profile', (req, res) => {
  res.render('update-profile', { profile: null, searched: false });
});

app.post('/update', async (req, res) => {
  const serialNumber = req.body.serialNumber;

  if (!serialNumber) {
    // If no serial number provided, render the update-profile template with null profile and searched flag
    return res.render('update-profile', { profile: null, searched: true });
  }

  try {
    const dataRes = await updateProfileService.getProfileDetails(serialNumber);
    const profile = dataRes[0]; // Extract the profile data

    if (profile) {
      // Render the update-profile template with the profile data and its ID
      logger.info(profile.region)
      res.render('update-profile', { profile, searched: true });
    } else {
      // If profile not found, render the update-profile template with null profile and searched flag
      res.render('update-profile', { profile: null, searched: true });
    }
  } catch (error) {
    logger.error("Error fetching data:", error);

    // Handle error rendering update-profile template with null profile, searched flag, and error message
    res.render('update-profile', { profile: null, searched: true, error: 'Internal Server Error' });
  }
});

app.post('/update-profile/:id', async (req, res) => {
  const { valid, parsedId, error } = updateProfileService.validateId(req.params.id);
  if (!valid) {
    return res.status(400).send(error);
  }

  const { query, values } = updateProfileService.prepareUpdateQuery(req.body, parsedId);

  try {
    const updatedProfile = await updateProfileService.updateProfileInDatabase(query, values, parsedId);
    res.render('update-profile', { profile: updatedProfile, successMessage: 'Profile updated successfully' });
  } catch (err) {
    logger.error('Error updating profile:', err);
    res.status(500).send('Error updating profile');
  }
});

app.post('/searchProfiles', isAuthenticated, async (req, res) => {
  try {
    const {
      inputSerialNo, inputGender, inputGothiram, Natchathiram,
      inputage, inputsiblings, inputplace, inputGraduation,
      inputMonSalary, region, isMathimam, isRemarried
    } = req.body;

    let responseSearch = null;

    if (inputSerialNo) {
      responseSearch = await profileService.getProfileDetails(inputSerialNo);

      if (responseSearch && responseSearch.length > 0) {
        const profile = responseSearch[0];
        req.body.inputGender = profile.gender;
        req.body.inputGothiram = profile.gothram;
        req.body.Natchathiram = profile.nakshatram;
      }
    }

    logger.info('natchatiram '+req.body.Natchathiram)
    logger.info('inputGothiram '+req.body.inputGothiram)
    logger.info('inputGender '+req.body.inputGender)

    const queryParams = {
      nakshatraid: req.body.Natchathiram,
      includeMathimam: isMathimam ? 'Y': "N",
      gothram: req.body.inputGothiram,
      age: req.body.inputage || '35', //TODO: Default age can be set to 35 need to check with Baskar
      siblings: req.body.inputsiblings || '',
      place: req.body.inputplace || '',
      serial_no: req.body.inputSerialNo || '',
      qualification: req.body.inputGraduation || '',
      monthsalary: req.body.inputMonSalary || '',
      region: req.body.region || '',
      isMathimam: req.body.isMathimam ? 'Y' : 'N',
      isRemarried: req.body.isRemarried ? 'Y' : 'N'
    };
    logger.info('query params isremarried '+queryParams.isRemarried)
    logger.info('query params age '+queryParams.age)
    logger.info('query params '+queryParams)
    const profiles = await profileService.findMatchingProfiles(queryParams, req.body.inputGender);

    // Store the fetched data in the session
    req.session.profiles = profiles;

    // Respond with the fetched profiles
    res.json(profiles);
  } catch (error) {
    logger.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/selectGothram', async (req, res) => {
  try {
    const userInput = req.query.input; // Get user input from query parameter
    const gothrams = await gothramService.getGothrams(userInput);
    res.json(gothrams);
  } catch (error) {
    logger.error('Error fetching gothrams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/Matrimony', isAuthenticated, (req, res) => {
  res.render('Matrimony');
});

app.get('/Profile', isAuthenticated, (req, res) => {
  res.render('Profile');
});

app.get('/ListProfiles', isAuthenticated, (req, res) => {
  res.render('Showallprofile');
});

app.get('/shortlistedprofiles',  isAuthenticated,(req, res) => {
  try {
      // Retrieve the stored data from session
      const profiles = req.session.profiles;
   
       // Check if profiles array is empty
      
    if (profiles && profiles.length > 0) {
        // Render the 'shortlistedprofiles' page with the fetched data
        res.render('shortlistedprofiles', { profiles });
    } else {
        // Render the 'noDataFound' page when no profiles are available
        res.render('noDataFound');
    }
  } catch (error) {
      logger.error('Error rendering page:', error);
      res.status(500).send('Internal Server Error');
  }
});



// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).send('Unauthorized Access. Please Login !');
  }
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.status(200).send({ message: 'Login successful.' });
  } else {
    res.status(401).send({ message: 'Invalid username or password.' });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
