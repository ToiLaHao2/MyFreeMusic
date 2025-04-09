const validationRules = {
    //Auth middleware validate
    login: {
        checkMessage: "Login to account",
        requiredFields: ["user_email", "user_password", "checkMessage"],
    },
    logout: {
        checkMessage: "Logout from account",
        requiredFields: ["", "checkMessage"],
    },
    changePassword: {
        checkMessage: "Change password",
        requiredFields: [
            "user_email",
            "user_password",
            "user_last_password",
            "checkMessage",
        ],
        minLength: {
            user_password: 6,
        },
    },
};

module.exports = { validationRules };
