// controllers/auth.controller.js
const {
    VerifiedToken,
    CreateAccessToken,
    CreateRefreshToken,
    HashPassword,
} = require("../util/authHelpers");
const { sendSuccess, sendError } = require("../util/response");
const { User } = require("../models/user.model");
const logger = require("../util/logger");

async function refreshAccessToken(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(res, 401, "Refresh token không được cung cấp.");
    }

    try {
        const decoded = VerifiedToken(refreshToken);
        if (!decoded) {
            return sendError(res, 403, "Refresh token không hợp lệ.");
        }

        const newAccessToken = CreateAccessToken(decoded.id);
        if (!newAccessToken) {
            return sendError(res, 500, "Không thể tạo access token mới.");
        }

        return sendSuccess(res, 200, {
            message: "Tạo access token mới thành công.",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return sendError(res, 500, "Lỗi không xác định.");
    }
}

async function login(req, res) {
    try {
        const { user_email, user_password } = req.body;
        // Kiểm tra thông tin đăng nhập (username, password) ở đây
        const user = await User.findOne({
            where: { user_email: user_email },
        });
        if (!user) {
            return sendError(
                res,
                401,
                "Tên đăng nhập hoặc mật khẩu không đúng."
            );
        }
        const isPasswordValid = await CompareHashPassword(
            user_password,
            user.user_hash_password
        );
        if (!isPasswordValid) {
            return sendError(
                res,
                401,
                "Tên đăng nhập hoặc mật khẩu không đúng."
            );
        }
        // Tạo access token
        const accessToken = await CreateAccessToken(user.id);
        const refreshToken = await CreateRefreshToken(user.id);
        if (!accessToken || !refreshToken) {
            return sendError(res, 500, "Không thể tạo token.");
        }
        // Lưu refresh token vào cơ sở dữ liệu (nếu cần)
        // Đánh dấu người dùng là đang hoạt động
        user.user_is_active = true;
        // Cập nhật thông tin người dùng trong cơ sở dữ liệu
        await user.save();
        // await refreshToken.save();
        // Trả về token cho client
        return sendSuccess(res, 200, {
            message: "Đăng nhập thành công.",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        logger.error("Error during login: ", error);
        return sendError(res, 500, "Lỗi không xác định.");
    }
}

async function logout(req, res) {
    try {
        const { user_id } = req.body;
        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findOne({ where: { id: user_id } });
        if (!user) {
            return sendError(res, 404, "Người dùng không tồn tại.");
        }
        // Đánh dấu người dùng là không hoạt động
        user.user_is_active = false;
        await user.save();
        // Xóa refresh token (nếu cần)
        // await RefreshToken.destroy({ where: { user_id } });
        // Trả về phản hồi thành công
        return sendSuccess(res, 200, {
            message: "Đăng xuất thành công.",
        });
    } catch (error) {
        logger.error("Error during logout: ", error);
        return sendError(res, 500, "Lỗi không xác định.");
    }
}

async function changePassword(req, res) {
    try {
        const { user_id, old_password, new_password } = req.body;
        const user = await User.findOne({ where: { id: user_id } });
        if (!user) {
            return sendError(res, 404, "Người dùng không tồn tại.");
        }
        // Kiểm tra xem mật khẩu cũ có đúng không
        const isPasswordValid = await CompareHashPassword(
            old_password,
            user.user_hash_password
        );
        if (!isPasswordValid) {
            return sendError(res, 401, "Mật khẩu cũ không đúng.");
        }
        // Cập nhật mật khẩu mới
        const hashedPassword = await HashPassword(new_password);
        user.user_hash_password = hashedPassword;
        await user.save();
        // Trả về phản hồi thành công
        return sendSuccess(res, 200, {
            message: "Đổi mật khẩu thành công.",
        });
    } catch (error) {
        logger.error("Error during change password: ", error);
        return sendError(res, 500, "Lỗi không xác định.");
    }
}

module.exports = {
    refreshAccessToken,
    login,
    logout,
    changePassword,
};
