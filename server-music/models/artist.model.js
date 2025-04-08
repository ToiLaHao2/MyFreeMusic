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
            name: DataTypes.STRING,
            biography: DataTypes.TEXT,
            profile_picture_url: DataTypes.STRING,
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            sequelize,
            modelName: "Artist",
            tableName: "artists",
            timestamps: false,
        }
    );

    return Artist;
};
module.exports = initArtist;
