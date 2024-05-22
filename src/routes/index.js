// routes/index.js
const { Router } = require("express");
const { AuthRouter } = require("./auth");
const  {UsersRouter}  = require("./users");
const { SkillsRouter } = require("./skills");
const authMiddleware = require("../middlewares/authMiddleWare");


const AppRouter = Router();

AppRouter.use("/auth", AuthRouter);
AppRouter.use("/users", authMiddleware, UsersRouter);
AppRouter.use("/skills",authMiddleware, SkillsRouter);

module.exports = { AppRouter };