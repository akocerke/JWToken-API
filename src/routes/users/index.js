const { Router } = require("express");
const { StatusCodes } = require("http-status-codes");
const Users = require("../../database/models/user");
const UserProfile = require("../../database/models/userProfile");
const logger = require("../../services/logger");

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



module.exports = { UsersRouter };
