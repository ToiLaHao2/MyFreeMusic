const { Model, DataTypes } = require("sequelize");

class User extends Model {}

const initUser = (sequelize) => {
    User.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_full_name: DataTypes.STRING,
            user_email: { type: DataTypes.STRING, unique: true },
            user_hash_password: DataTypes.STRING,
            user_phone_number: DataTypes.STRING,
            user_profile_picture: DataTypes.STRING,
            user_is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: false,
        }
    );

    return User;
};

module.exports = initUser;
