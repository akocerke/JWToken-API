// api.js
const axios = require('axios');

const api = axios.create({
  baseURL: "http://localhost:3030/jwtoken",
});

module.exports = api;