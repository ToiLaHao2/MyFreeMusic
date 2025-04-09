// configs/loggerConfig.js

const path = require("path");

module.exports = {
    // Log level: error < warn < info < verbose < debug < silly
    level: process.env.LOG_LEVEL || "info",

    // Format config
    format: {
        timestampFormat: "YYYY-MM-DD HH:mm:ss",
        json: false, // true = log ra dạng JSON
    },

    // Transport config
    transports: {
        console: true,

        file: {
            enabled: true,
            path: path.join(__dirname, "../logs/app.log"),
            errorPath: path.join(__dirname, "../logs/error.log"),
        },
    },
};
