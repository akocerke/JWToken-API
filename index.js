require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { AppRouter } = require("./src/routes");
const path = require('path');

// Zugriff auf Umgebungsvariablen
const { PORT } = process.env;

// Initialisierung von express
const app = express();
app.use(bodyParser.json());
// Use for development
app.use(cors());

app.use("/jwtoken", AppRouter);


app.use('/uploads/profile_images', express.static(path.join(__dirname, 'src', 'routes', 'users', 'uploads', 'profile_images')));

// App hört im folgenden auf den Port, welcher über die Umgebungsvariable definiert ist
app.listen(PORT, () => {
  console.log(`jwtoken app listening on port ${PORT}`);
});