/**
 * Hàm lấy token từ header Authorization
 * @param {Object} req - Đối tượng request từ Express
 * @returns {string|null} - Token hoặc null nếu không tồn tại
 */
const logger = require("../logger");

async function getTokenFromHeaders(req) {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            // Không có header Authorization
            return null;
        }

        // Kiểm tra định dạng header Authorization
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            // Không đúng định dạng `Bearer <token>`
            return null;
        }

        // Trả về token
        const token = parts[1];
        return token;
    } catch (error) {
        // Log lỗi nếu có
        logger.info("Error get token from header: " + error);
        return null;
    }
}

module.exports = { getTokenFromHeaders };
