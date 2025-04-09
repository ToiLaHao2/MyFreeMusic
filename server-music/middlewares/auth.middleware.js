const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const { VerifiedToken } = require("../utils/authHelpers");
const { sendError } = require("../util/response");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return sendError(res, 401, "Không có token xác thực.");
    }

    try {
        const decoded = await VerifiedToken(token);
        if (!decoded) {
            return sendError(res, 401, "Token không hợp lệ.");
        }
        req.user_id = decoded.id;

        // Check thời gian còn lại
        const timeRemaining = decoded.exp * 1000 - Date.now();
        const timeLimit = 5 * 60 * 1000; // 5 phút

        if (timeRemaining < timeLimit) {
            req.token_near_expire = true;
        }

        next();
    } catch (error) {
        logger.warn("Token hết hạn hoặc không hợp lệ.");
        return sendError(res, 401, "Token hết hạn hoặc không hợp lệ.");
    }
};

module.exports = authMiddleware;
