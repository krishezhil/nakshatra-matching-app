const { sequelize } = require('../config/dbconfig');
const { isDbConnected } = require('../utils/dbMonitor');

const users = [
  { username: 'user1', password: 'password1' },
  { username: 'admin', password: 'admin' },
  { username: 'a', password: 'a' }
];

exports.login = (req, res) => {

  // Check DB connection
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database is down.' });
  }

  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = user;
    res.status(200).send({ message: 'Login successful.' });
  } else {
    res.status(401).send({ message: 'Invalid username or password.' });
  }
};