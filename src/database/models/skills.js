// models/skills.js
const { DataTypes } = require("sequelize");
const sequelize = require('../setup/database');

const Skill = sequelize.define("Skills", {
    skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    skill_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    skill_description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: "skills", // Angabe der korrekten Tabellenbezeichnung
    timestamps: false // Deaktivierung von automatisch hinzugefügten Zeitstempeln
});

module.exports =  Skill ;
