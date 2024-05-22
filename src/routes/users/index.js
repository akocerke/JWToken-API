const { Router } = require("express");
const { StatusCodes } = require("http-status-codes");
const Users = require("../../database/models/user");
const UserProfile = require("../../database/models/userProfile");
const logger = require("../../services/logger");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink);
const url = require('url');
const bcrypt = require('bcrypt');


// Multer-Konfiguration für Profilbild-Upload
const profileImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads', 'profile_images');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const profileImageUpload = multer({
    storage: profileImageStorage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Beispiel für eine Begrenzung auf 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Nur Bild-Uploads sind erlaubt!'), false);
        }
    }
});



const UsersRouter = Router();

// GET-currentUser
UsersRouter.get("/currentuser", async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: ["id", "email", "profile_image_path"],
    });

    if (!user) {
      logger.error("User nicht gefunden mit der ID: " + req.user.id);
      return res.status(StatusCodes.NOT_FOUND).send("User not found");
    }

    logger.info(
      `Benutzer mit der ID: ${user.id} erfolgreich abgerufen , Email: ${user.email}`
    );
    res.status(StatusCodes.OK).json(user);
  } catch (error) {
    logger.error("Error fetching user data:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error fetching user");
  }
});
// GET Profile
UsersRouter.get("/profile", async (req, res) => {
  if (!req.user || !req.user.id) {
      return res.status(401).send('Authentication required');
  }
  try {
      const userProfile = await UserProfile.findOne({
          where: { user_id: req.user.id }
      });

      if (!userProfile) {
          return res.status(404).send('Profile not found');
      }

      res.status(200).json(userProfile);
  } catch (error) {
      console.error('Error fetching profile data:', error);
      res.status(500).send('Error fetching profile');
  }
});

// PUT - Benutzerprofil aktualisieren
UsersRouter.put("/updateprofile", async (req, res) => {
  try {
    // Überprüfe, ob ein Benutzer mit dieser ID existiert
    const user = await Users.findByPk(req.user.id);
    if (!user) {
      logger.error("User not found with ID: " + req.user.id);
      return res.status(404).send("User not found");
    }

    const { firstName, lastName, streetName, streetNumber, city, postalCode } =
      req.body;

    // Überprüfe, ob ein Profil existiert, und aktualisiere oder erstelle es
    const userProfile = await UserProfile.findOne({
      where: { user_id: req.user.id },
    });

    if (userProfile) {
      // Aktualisiere das vorhandene Profil
      await userProfile.update({
        first_name: firstName,
        last_name: lastName,
        street_name: streetName,
        street_number: streetNumber,
        city: city,
        postal_code: postalCode
      });
      logger.info(`Profile updated for user ID: ${req.user.id}`);
    } else {
      // Erstelle ein neues Profil, wenn noch keines existiert
      await UserProfile.create({
        user_id: req.user.id,
        first_name: firstName,
        last_name: lastName,
        street_name: streetName,
        street_number: streetNumber,
        city: city,
        postal_code: postalCode
      });
      logger.info(`Profile created for user ID: ${req.user.id}`);
    }

    res.status(200).json({
      message: "Profile successfully updated or created",
      profile: {
        first_name: firstName,
        last_name: lastName,
        street_name: streetName,
        street_number: streetNumber,
        city: city,
        postal_code: postalCode
      },
    });
  } catch (error) {
    logger.error("Error updating profile data:", error);
    res.status(500).send("Error updating profile");
  }
});

// PUT - Profilbild aktualisieren
UsersRouter.put('/profile/upload', profileImageUpload.single('profile_image'), async (req, res) => {
  if (!req.user || !req.user.id) {
    logger.error('Authentication required: User data missing');
    return res.status(401).send('Authentication required');
  }

  if (!req.file) {
    logger.error('Kein Datei-Upload erhalten');
    return res.status(400).send('Keine Datei hochgeladen');
  }

  try {
    const user = await Users.findByPk(req.user.id);
    if (!user) {
      logger.error(`Benutzer nicht gefunden: ID ${req.user.id}`);
      return res.status(404).send('Benutzer nicht gefunden');
    }

    // Überprüfe, ob der Pfad eine URL ist
    if (user.profile_image_path && !user.profile_image_path.startsWith('http')) {
      const oldImagePath = path.join(__dirname, 'uploads', 'profile_images', path.basename(user.profile_image_path));
      try {
        await unlink(oldImagePath);
        logger.info(`Altes Bild gelöscht: ${oldImagePath}`);
      } catch (err) {
        logger.error(`Fehler beim Löschen des alten Bildes: ${err}`);
        // Optional: Fehler beim Löschen ignorieren und weitermachen
      }
    }

    // Neues Bild speichern
    const imagePath = `/uploads/profile_images/${req.file.filename}`;
    await user.update({ profile_image_path: imagePath });

    logger.info(`Benutzer ID: ${req.user.id} Profilbild aktualisiert: ${imagePath}`);
    res.status(200).json(`Profilbild aktualisiert: ${imagePath}`);
  } catch (error) {
    logger.error(`Fehler beim Aktualisieren des Profilbilds: ${error}`);
    res.status(500).send('Fehler beim Aktualisieren des Profilbilds');
  }
});

// PUT Passwort ändern
UsersRouter.put('/updatePassword', async (req, res) => {
  const userId = req.user.id; // Extrahiere die Benutzer-ID aus dem Token
  const { oldPassword, newPassword } = req.body;

  try {
    // Protokolliere die empfangenen Daten
    logger.info(`Empfangene Daten: userId=${userId}, oldPassword=${oldPassword}, newPassword=${newPassword}`);

    // Finde den Benutzer anhand seiner ID
    const user = await Users.findByPk(userId);

    // Überprüfe, ob der Benutzer existiert
    if (!user) {
      logger.error('Benutzer nicht gefunden');
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Vergleiche das eingegebene alte Passwort mit dem in der Datenbank gespeicherten Passwort
    const match = await bcrypt.compare(oldPassword, user.password);

    // Überprüfe, ob das alte Passwort korrekt ist
    if (!match) {
      logger.error('Altes Passwort ist falsch');
      return res.status(401).json({ error: 'Altes Passwort ist falsch' });
    }

    // Hashen des neuen Passworts
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Aktualisiere das Passwort des Benutzers in der Datenbank
    user.password = hashedPassword;
    await user.save();

    logger.info('Passwort erfolgreich geändert');
    res.status(200).json({ message: 'Passwort erfolgreich geändert' });
  } catch (error) {
    logger.error(`Fehler beim Ändern des Passworts: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// PUT Email Adresse updaten
UsersRouter.put('/updateEmail', async (req, res) => {
  const userId = req.user.id; // Extrahiere die Benutzer-ID aus dem Token
  const { emailAlt, newEmail } = req.body;

  try {
    // Finde den Benutzer anhand seiner ID
    const user = await Users.findByPk(userId);

    if (!user) {
      logger.error('Benutzer nicht gefunden');
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }
    // Überprüfe, ob die eingegebene alte E-Mail-Adresse korrekt ist
    if (emailAlt !== user.email) {
      logger.error('Falsche alte E-Mail-Adresse');
      return res.status(400).json({ error: 'Falsche alte E-Mail-Adresse' });
    }
    // Aktualisiere die E-Mail-Adresse des Benutzers
    user.email = newEmail;
    await user.save();

    logger.info('E-Mail-Adresse erfolgreich aktualisiert');
    res.status(200).json({ message: 'E-Mail-Adresse erfolgreich aktualisiert' });
  } catch (error) {
    logger.error(`Fehler beim Aktualisieren der E-Mail-Adresse: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});


// DELETE /deleteAccount zum Löschen des Benutzerkontos
// UsersRouter.delete('/deleteAccount', async (req, res) => {
 

module.exports = { UsersRouter };
