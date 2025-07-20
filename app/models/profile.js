const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/dbconfig").sequelize;

const Profile = sequelize.define("profile", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    serial_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    father_name: {
        type: DataTypes.STRING,
    },
    mother_name: {
        type: DataTypes.STRING,
    },
    siblings: {
        type: DataTypes.STRING,
    },
    gothram: {
        type: DataTypes.STRING,
    },
    birth_date: {
        type: DataTypes.DATEONLY,
    },
    birth_time: {
        type: DataTypes.TIME,
    },
    birth_place: {
        type: DataTypes.STRING,
    },
    qualification: {
        type: DataTypes.STRING,
    },
    job_details: {
        type: DataTypes.STRING,
    },
    monthly_income: {
        type: DataTypes.INTEGER,
    },
    address: {
        type: DataTypes.STRING,
    },
    contact_no: {
        type: DataTypes.STRING,
    },
    gender: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    additional_contact_no: {
        type: DataTypes.STRING,
    },
    qualification_details: {
        type: DataTypes.STRING,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
    },
    nakshatraid: {
        type: DataTypes.INTEGER,
        field: "nakshatraid",
        references: {
            model: "nakshatras",
            key: "id",
        },
    },
    // Sequelize will handle these automatically:
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "createdat", // match your DB column name
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updatedat",
    },
    is_remarried: {
        type: DataTypes.BOOLEAN,
    },
    // Add your new fields
    rasi_lagnam: {
        type: DataTypes.STRING,   // Or DataTypes.INTEGER if it's a lookup ID
        allowNull: true           // Change to false if it's mandatory
    },
    navamsam_lagnam: {
        type: DataTypes.STRING,   // Or DataTypes.INTEGER based on your design
        allowNull: true
    },
});

module.exports = Profile;
