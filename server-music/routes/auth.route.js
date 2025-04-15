const express = require("express");
const validate = require("../middlewares/validate.middleware");
const {
    login,
    refreshAccessToken,
    changePassword,
    logout,
} = require("../controllers/auth.controller");
const authRouter = express.Router();

authRouter.post("/refresh-token", validate("refreshToken"), refreshAccessToken);
authRouter.post("/login", validate("login"), login);
authRouter.post("/logout", validate("logout"), logout);
authRouter.post("/changePassword", validate("changePassword"), changePassword);

module.exports = authRouter;
