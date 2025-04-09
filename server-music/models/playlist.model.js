const { Model, DataTypes } = require("sequelize");

class Playlist extends Model {}

const initPlaylist = (sequelize) => {
    Playlist.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            playlist_name: DataTypes.STRING,
            playlist_description: DataTypes.STRING,
            playlist_cover_url: DataTypes.STRING,
            playlist_is_private: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            user_id: { type: DataTypes.UUID, allowNull: false },
        },
        {
            sequelize,
            modelName: "Playlist",
            tableName: "playlists",
            timestamps: true,
        }
    );

    return Playlist;
};

module.exports = { Playlist, initPlaylist };
