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
            name: DataTypes.STRING,
            description: DataTypes.STRING,
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: "Genre",
            tableName: "genres",
            timestamps: false,
        }
    );
    return Genre;
};
module.exports = { Genre, initGenre };
