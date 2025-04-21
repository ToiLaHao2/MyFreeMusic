const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(/* config */);

const initUser = require("./user.model");
const initPlaylist = require("./playlist.model");
const initSong = require("./song.model");
const initGenre = require("./genre.model");
const initArtist = require("./artist.model");

const User = initUser(sequelize);
const Playlist = initPlaylist(sequelize);
const Song = initSong(sequelize);
const Genre = initGenre(sequelize);
const Artist = initArtist(sequelize);

// Gắn quan hệ tại đây
User.hasMany(Playlist, { foreignKey: "user_id" });
Playlist.belongsTo(User, { foreignKey: "user_id" });
Genre.hasMany(Song, { foreignKey: "genre_id" });
Song.belongsTo(Genre, { foreignKey: "genre_id" });
Artist.hasMany(Song, { foreignKey: "artist_id" });
Song.belongsTo(Artist, { foreignKey: "artist_id" });

// (nâng cao) nếu dùng Playlist-Song là n-n
Playlist.belongsToMany(Song, { through: "PlaylistSongs" });
Song.belongsToMany(Playlist, { through: "PlaylistSongs" });

module.exports = {
    sequelize,
    User,
    Playlist,
    Song,
    Genre,
    Artist,
};
