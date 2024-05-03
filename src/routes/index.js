// routes/index.js
const { Router } = require("express");
const { AuthRouter } = require("./auth");
const  {UsersRouter}  = require("./users");

const AppRouter = Router();

AppRouter.use("/auth", AuthRouter);
AppRouter.use("/users", UsersRouter);

module.exports = { AppRouter };