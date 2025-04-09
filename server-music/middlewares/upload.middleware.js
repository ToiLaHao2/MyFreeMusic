const multer = require("multer");
const path = require("path");

// Tạo thư mục đích
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isImage = file.mimetype.startsWith("image/");
        const isAudio = file.mimetype.startsWith("audio/");

        let folder = "uploads/others";
        if (isImage) folder = "uploads/images";
        if (isAudio) folder = "uploads/songs";

        cb(null, folder); // tạo tự động nếu chưa có
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

// Bộ lọc loại file
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/mp3", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File không hợp lệ (chỉ nhận .mp3, .jpg, .png)"), false);
    }
};

// Tạo middleware
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // Giới hạn 20MB
});

module.exports = upload;
