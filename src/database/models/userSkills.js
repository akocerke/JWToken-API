// models/userSkills.js
const { DataTypes } = require("sequelize");
const sequelize = require('../setup/database');
const  Skill  = require("./skills"); 

const UserSkill = sequelize.define("UserSkill", {
    user_skill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    skill_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    proficiency_level: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Expert'),
        allowNull: false
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "user_skills", // Angabe der korrekten Tabellenbezeichnung
    timestamps: false // Deaktivierung von automatisch hinzugefügten Zeitstempeln
});

// Definiere Beziehung zu Skills
UserSkill.belongsTo(Skill, { foreignKey: "skill_id" });

module.exports =  UserSkill;
