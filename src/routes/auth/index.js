// routes/auth/index.js
const { Router } = require("express");
const Users = require("../../database/models/user");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require('jsonwebtoken');
const { generateToken } = require('../../services/auth/AccessToken');
const md5 = require('md5');
const logger = require ("../../services/logger");

// Funktion zum Generieren des Gravatar-Links
const generateGravatarUrl = (email) => {
  const lowercasedEmail = email.trim().toLowerCase();
  const hash = md5(lowercasedEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};
const AuthRouter = Router();


// Login Funktion mit token
AuthRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email: email } });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Benutzer nicht gefunden" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Ungültige Anmeldeinformationen" });
    }

    const token = generateToken(user);

    res.status(StatusCodes.OK).json({ message: "Login erfolgreich", token: token });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Ein Fehler ist aufgetreten", error: error.message });
  }
});


// Benutzerregistrierung
AuthRouter.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await Users.findOne({ where: { email: email } });
    if (existingUser) {
      logger.warn(`Registrierungsversuch mit vorhandener E-Mail: ${email}`); // Warnung loggen
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Benutzername bereits vergeben. Bitte wählen Sie einen anderen Benutzernamen.",
      });
    }

    const avatarUrl = generateGravatarUrl(email);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      email: email,
      password: hashedPassword,
      profile_image_path: avatarUrl
    });

    logger.info(`Neuer Benutzer registriert: ${email}, Bild-URL: ${avatarUrl}`); // Info Loggen

    res.status(StatusCodes.CREATED).json({ message: "Benutzer erfolgreich registriert.", user: newUser }); 
  } catch (error) {
    logger.error(`Fehler bei der Registrierung: ${error.message}`); // Fehler loggen
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Fehler bei der Registrierung. Bitte versuchen Sie es erneut.",
    });
  }
});
// Logout Funktion mit roken überprüfen inkl console.log
AuthRouter.post("/logout", (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token verification failed:", err);
        return res.sendStatus(403); // Bei ungültigem Token
      }

      console.log(`Logout requested by user ID: ${decoded.id}`); // Hier loggen wir die Benutzer-ID
      res.status(StatusCodes.OK).json({ message: "Logout erfolgreich. Token gelöscht" });
    });
  } else {
    console.log("No token provided for logout");
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Kein Token bereitgestellt" });
  }
});


module.exports = { AuthRouter };