// Simple global DB status tracker
let dbConnected = false;

function setDbConnected(status) {
  dbConnected = status;
}

function isDbConnected() {
  return dbConnected;
}

module.exports = { setDbConnected, isDbConnected };
