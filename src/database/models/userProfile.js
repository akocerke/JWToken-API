// models/userProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('../setup/database');
const User = require('./user');  // Importiere das User-Modell, um die Beziehung zu definieren

const UserProfile = sequelize.define('UserProfile', {
  profile_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // Dies verweist auf das User-Modell
      key: 'id'    // Der Schlüssel im User-Modell, auf den verwiesen wird
    }
  },
  first_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  street_name: {
    type: DataTypes.STRING,
  },
  street_number: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  postal_code: {
    type: DataTypes.STRING,
  }
}, {
  tableName: 'user_profile',  // Gibt den Tabellennamen explizit an
  timestamps: false           // Deaktiviert die automatische Erstellung von createdAt und updatedAt Feldern
});

// Definiere die Beziehung zwischen User und UserProfile
User.hasOne(UserProfile, { foreignKey: 'user_id' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserProfile;
