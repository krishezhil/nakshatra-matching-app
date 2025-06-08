const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig').sequelize;

const Nakshatra = sequelize.define("nakshatra", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});
  
module.exports = Nakshatra;