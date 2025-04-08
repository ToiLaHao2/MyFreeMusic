const { Model, DataTypes } = require("sequelize");

class Song extends Model {}

const initSong = (sequelize) => {
    Song.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fileUrl: DataTypes.STRING,
            coverUrl: DataTypes.STRING,
            views: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },

            genre_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            artist_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Song",
            tableName: "songs",
            timestamps: true,
        }
    );

    return Song;
};

module.exports = initSong;
