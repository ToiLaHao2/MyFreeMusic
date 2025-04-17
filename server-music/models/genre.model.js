const { Model, DataTypes } = require("sequelize");

class Genre extends Model {}

const initGenre = (sequelize) => {
    Genre.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false, // Không cho phép giá trị null cho tên thể loại
            },
            description: DataTypes.STRING,
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Genre",
            tableName: "genres",
            timestamps: false, // Bỏ qua timestamps nếu bạn tự quản lý created_at, updated_at
        }
    );
    return Genre;
};

module.exports = { Genre, initGenre };
