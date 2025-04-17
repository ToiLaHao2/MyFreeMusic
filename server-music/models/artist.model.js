const { Model, DataTypes } = require("sequelize");

class Artist extends Model {}

const initArtist = (sequelize) => {
    Artist.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false, // Không cho phép giá trị null cho tên nghệ sĩ
            },
            biography: DataTypes.TEXT,
            profile_picture_url: DataTypes.STRING,
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
            modelName: "Artist",
            tableName: "artists",
            timestamps: false, // Tương tự như Genre, bỏ qua timestamps nếu muốn quản lý created_at, updated_at riêng
        }
    );

    return Artist;
};

module.exports = { Artist, initArtist };
