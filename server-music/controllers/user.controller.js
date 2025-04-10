const { User } = require("../models/user.model");
const logger = require("../util/logger");
const { sendSuccess, sendError } = require("../util/response");
const cloudinary = require("../config/cloudinary.config");

// User controller
// Get user information
async function GetUserInformation(req, res) {
    try {
        const { user_id } = req.params;
        const user = await User.findOne({
            where: { user_id: user_id },
            attributes: {
                exclude: ["user_hash_password", "user_refresh_token"],
            },
        });
        if (!user) {
            return sendError(res, 404, "Người dùng không tồn tại.");
        }
        return sendSuccess(res, 200, {
            message: "Lấy thông tin người dùng thành công.",
            user: user,
        });
    } catch (error) {
        logger.error("Lỗi khi lấy thông tin người dùng:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}

// Update user information
async function UpdateUserInformation(req, res) {
    try {
        const { user_id } = req.params;
        const { user_full_name, user_email, user_phone_number } = req.body;
        const user = await User.findOne({ where: { user_id: user_id } });
        if (!user) {
            return sendError(res, 404, "Người dùng không tồn tại.");
        }
        await User.update(
            {
                user_full_name: user_full_name,
                user_email: user_email,
                user_phone_number: user_phone_number,
            },
            { where: { user_id: user_id } }
        );
        return sendSuccess(res, 200, {
            message: "Cập nhật thông tin người dùng thành công.",
        });
    } catch (error) {
        logger.error("Lỗi khi cập nhật thông tin người dùng:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}

// Change user avatar
async function ChangeUserAvatar(req, res) {
    try {
        const { user_id } = req.params;
        const file = req.file;

        // Kiểm tra user có tồn tại không
        const user = await User.findOne({ where: { user_id: user_id } });
        if (!user) {
            return sendError(res, 404, "Người dùng không tồn tại.");
        }
        // kiểm tra xem đã có ảnh chưa
        if (user.user_profile_picture) {
            // Xóa ảnh cũ
            await cloudinary.uploader.destroy(user.user_profile_picture);
        }
        // Upload ảnh lên Cloudinary
        cloudinary.uploader
            .upload_stream(
                { folder: "userMusicAvatar" }, // Lưu ảnh vào thư mục "avatars"
                async (error, result) => {
                    if (error) {
                        logger.error(
                            `Cloudinary upload error: ${error.message}`
                        );
                        return sendError(
                            res,
                            500,
                            "Cloudinary upload failed",
                            error.message
                        );
                    }

                    // Lưu URL ảnh vào database
                    user.user_profile_picture = result.secure_url;
                    await user.save();

                    sendSuccess(
                        res,
                        "Avatar uploaded successfully",
                        user,
                        "UploadAvatar"
                    );
                }
            )
            .end(file.buffer); // Đẩy dữ liệu ảnh lên Cloudinary
    } catch (error) {
        logger.error("Error uploading avatar:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}

// Get All users information (admin)
// async function GetAllUsersInformation(req, res) {
//     try {
//         const users = await User.findAll({ include: ["userMusic"] });
//         sendSuccess(
//             res,
//             "Danh sách người dùng",
//             users,
//             "GetAllUsersInformation"
//         );
//     } catch (error) {
//         logger.error("Lỗi khi lấy thông tin người dùng:", error);
//         return sendError(res, 500, "Lỗi hệ thống.");
//     }
// }
// Delete user (admin)
// async function DeleteUser(req, res) {
//     try {
//         const id = req.params.id;
//         const user = await User.destroy({ where: { id } });
//         sendSuccess(res, "Xóa người dùng thành công", user, "DeleteUser");
//     } catch (error) {
//         logger.error("Lỗi khi lấy thông tin người dùng:", error);
//         return sendError(res, 500, "Lỗi hệ thống.");
//     }

module.exports = {
    GetUserInformation,
    UpdateUserInformation,
    ChangeUserAvatar,
};
