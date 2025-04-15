const { createLogger, format, transports } = require("winston");
const loggerConfig = require("../config/logger.config");

const logFormat = format.combine(
    format.timestamp({
        format: loggerConfig.format.timestampFormat || "YYYY-MM-DD HH:mm:ss",
    }),
    loggerConfig.format.json
        ? format.json() // Nếu log dạng JSON
        : format.printf(({ timestamp, level, message }) => {
              return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
          })
);

const loggerTransports = [];
if (loggerConfig.transports.console) {
    loggerTransports.push(new transports.Console());
}

if (loggerConfig.transports.file.enabled) {
    loggerTransports.push(
        new transports.File({ filename: loggerConfig.transports.file.path })
    );
    loggerTransports.push(
        new transports.File({
            filename: loggerConfig.transports.file.errorPath,
            level: "error",
        })
    );
}

const logger = createLogger({
    level: loggerConfig.level,
    format: logFormat,
    transports: loggerTransports,
});

module.exports = logger;
