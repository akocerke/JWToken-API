// models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../setup/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_image_path: {
    type: DataTypes.STRING,  // Stelle sicher, dass dieser Typ korrekt ist
    defaultValue: null       // Optional: Setze ein Standardbild
  }
}, {
  tableName: 'user',  // Gibt den Tabellennamen explizit an
  timestamps: false   // Deaktiviert die automatische Erstellung von createdAt und updatedAt Feldern
});

module.exports = User;
