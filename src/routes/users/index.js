const { Router } = require("express");
const { StatusCodes } = require("http-status-codes");
const Users = require("../../database/models/user");

const UsersRouter = Router();

// GET-currentUser
UsersRouter.get("/currentuser", (req, res) => {
    // Der authentifizierte Benutzer ist nun verfügbar als req.user
    res.status(StatusCodes.OK).json(req.user);
});

module.exports = { UsersRouter };
