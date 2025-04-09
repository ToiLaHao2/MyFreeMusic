// middleware/validate.middleware.js
const { sendError } = require("../util/response");
const { validateFields } = require("../utils/validate");
const { validationRules } = require("../utils/validationRules"); // nơi chứa rules bạn viết

const validate = (ruleKey) => {
    return async (req, res, next) => {
        const rules = validationRules[ruleKey];
        if (!rules) {
            return sendError(res, 400, "Invalid rule key");
        }

        const validationResult = await validateFields(req.body, rules);

        if (!validationResult.valid) {
            return sendError(
                res,
                400,
                `Validation failed: ${validationResult.message}`
            );
        }

        // Nếu hợp lệ thì tiếp tục
        next();
    };
};

module.exports = validate;
