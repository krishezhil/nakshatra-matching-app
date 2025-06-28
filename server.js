require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./app/routes/auth-routes");
const matchRoute = require("./app/routes/routes");
const profileRoutes = require("./app/routes/profileroutes");
const exportRoutes = require("./app/routes/export-routes");
const commonRoutes = require("./app/routes/common-routes");
const session = require("express-session");
const logger = require("./app/utils/logger");
const app = express();
// const { Pool } = require('pg');
const { setDbConnected } = require("./app/utils/dbMonitor");
const PORT = process.env.PORT || 3000;
const sequelize = require("./app/config/dbconfig").sequelize;

var corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

app.use(cors(corsOptions));
// Set up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Serve static files (e.g., HTML, CSS, JS)
app.use(
  express.static("public", {
    setHeaders: (res, path, stat) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Middleware to handle sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallbackSecret", //TODO: Change this to a secure random string
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to parse request bodies
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", exportRoutes);
app.use("/", commonRoutes);
app.use("/api", matchRoute);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

app.locals.dbConnected = false;

// // Optional: Add global pg error listener to catch fatal errors
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start server
sequelize
  .authenticate()
  .then(() => {
    logger.info("Sequelize DB connected");
    app.locals.dbConnected = true;
  })
  .catch((err) => {
    logger.error(
      "Sequelize connection error, Check is database is running:",
      err
    );
    // process.exit(1); // Exit app if DB connection fails
    app.locals.dbConnected = false;
  });

// Global DB health check (every 10s)
let lastStatus = null;

setInterval(async () => {
  try {
    await sequelize.authenticate();

    if (lastStatus !== true) {
      logger.warn("DB connection restored");
      lastStatus = true;
    }

    setDbConnected(true);
  } catch (err) {
    if (lastStatus !== false) {
      logger.error("DB connection lost:", err.message);
      lastStatus = false;
    }

    setDbConnected(false);
  }
}, 10000); // adjust as needed

// Start the server regardless of DB connection
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
