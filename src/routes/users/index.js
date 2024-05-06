const { Router } = require("express");
const { StatusCodes } = require("http-status-codes");
const Users = require("../../database/models/user");

const UsersRouter = Router();

// GET-currentUser
UsersRouter.get("/currentuser", async (req, res) => {
    try {
        // Angenommen, req.user.id enthält die ID des authentifizierten Benutzers
        const user = await Users.findByPk(req.user.id, {
            attributes: ['id', 'email', 'profile_image_path']  // Stellen Sie sicher, dass 'profile_image_path' hier enthalten ist
        });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send('User not found');
        }

        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error fetching user');
    }
});

module.exports = { UsersRouter };
