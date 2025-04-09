const morgan = require("morgan");
const logger = require("../util/logger"); // dùng logger bạn đã tạo

// Tuỳ chỉnh morgan để dùng winston làm "viết log"
const stream = {
    write: (message) => {
        // Loại bỏ dấu xuống dòng \n cuối log (morgan luôn thêm)
        logger.info(message.trim());
    },
};

// Middleware logger
const loggerMiddleware = morgan("combined", { stream });

module.exports = loggerMiddleware;
