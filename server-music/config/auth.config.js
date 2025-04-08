require("dotenv").config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key",
    JWT_EXPIRES_IN: "7d",
    REFRESH_EXPIRES_IN: "30d",
};
