const dotenv = require("dotenv");
const { Pool } = require("pg");
const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");

// Load environment variables from .env file
dotenv.config();

// Option 2: Passing parameters separately (other dialects)
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database Name
  process.env.DB_USER, // User Name
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT, //'postgres', /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    logging: (msg) => logger.debug(msg), // Use winston for SQL logs
  }
);

sequelize
  .authenticate()
  .then(() => logger.info("Sequelize DB connected"))
  .catch((err) => logger.error("Sequelize connection error:", err));

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  logger.error("Unexpected PG pool error", err);
  process.exit(-1);
});

pool
  .connect()
  .then(() => logger.info("PostgreSQL pool connected"))
  .catch((err) => logger.error("PostgreSQL pool connection error:", err));

module.exports = { sequelize, pool };
