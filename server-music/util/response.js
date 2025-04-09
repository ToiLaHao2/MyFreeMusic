// utils/response.js

/**
 * Gửi response thành công
 * @param {Object} res - Đối tượng response của Express
 * @param {String} message - Thông điệp mô tả
 * @param {Object} data - Dữ liệu trả về
 */
const sendSuccess = (res, message, data = {}) => {
    res.status(200).json({
        success: true,
        message,
        data,
    });
};

/**
 * Gửi response lỗi
 * @param {Object} res - Đối tượng response của Express
 * @param {Number} statusCode - Mã trạng thái HTTP (vd: 400, 404, 500)
 * @param {String} message - Thông điệp mô tả
 * @param {Object} error - Thông tin lỗi chi tiết (nếu cần)
 */
const sendError = (res, statusCode, message, error = {}) => {
    res.status(statusCode).json({
        success: false,
        message,
        error,
    });
};

module.exports = {
    sendSuccess,
    sendError,
};
