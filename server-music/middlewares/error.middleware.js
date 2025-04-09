// middleware/error.middleware.js
const logger = require("../utils/logger"); // nếu có logger winston
const { sendError } = require("../util/response");

const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Lỗi không xác định";

    // Ghi log nếu có logger
    logger.error(`[${req.method}] ${req.originalUrl} - ${message}`);
    sendError(res, status, message);
};

module.exports = errorHandler;
