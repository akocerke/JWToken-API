const winston = require('winston');
require('dotenv').config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Nutze LOG_LEVEL aus der .env-Datei
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
