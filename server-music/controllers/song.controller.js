// Song controllers

const { Artist } = require("../models/artist.model");
const { Genre } = require("../models/genre.model");
const { Song } = require("../models/song.model");
const logger = require("../util/logger");
const { sendError, sendSuccess } = require("../util/response");
const cloudinary = require("../config/cloudinary.config");

// Add song from device
async function AddNewSongFromDevice(req, res) {
    try {
        const { songTitle, songGenreId, songArtistId } = req.body;
        const songFile = req.file;
        const songCover = req.file;
        if (!songFile || !songCover) {
            return sendError(res, 400, "Thiếu file bài hát hoặc ảnh bìa.");
        }
        // Check if the song already exists
        const existingSong = await Song.findOne({
            where: { title: songTitle },
        });
        if (existingSong) {
            return sendError(res, 400, "Bài hát đã tồn tại.");
        }
        // Check if the genre exists
        const genre = await Genre.findOne({ where: { id: songGenreId } });
        if (!genre) {
            return sendError(res, 400, "Thể loại không tồn tại.");
        }
        // Check if the artist exists
        const artist = await Artist.findOne({ where: { id: songArtistId } });
        if (!artist) {
            return sendError(res, 400, "Nghệ sĩ không tồn tại.");
        }
        // Check if the song file is valid
        const validFileTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
        if (!validFileTypes.includes(songFile.mimetype)) {
            return sendError(res, 400, "File bài hát không hợp lệ.");
        }
        // Check if the cover file is valid
        const validCoverTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validCoverTypes.includes(songCover.mimetype)) {
            return sendError(res, 400, "File ảnh bìa không hợp lệ.");
        }
        // Send cover file to cloudinary and receive URL
        let coverUrl = null;
        await cloudinary.uploader.upload(
            songCover.path,
            { folder: "music_app/covers" },
            async (error, result) => {
                if (error) {
                    logger.error("Lỗi khi upload ảnh bìa:", error);
                    return sendError(res, 500, "Lỗi hệ thống.");
                }
                coverUrl = result.secure_url;
            }
        );
        // Create new song
        const newSong = await Song.create({
            title: songTitle,
            fileUrl: songFile.path,
            coverUrl: coverUrl,
            genre_id: songGenreId,
            artist_id: songArtistId,
        });
    } catch (error) {
        logger.error("Lỗi khi thêm bài hát từ thiết bị:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Add song from Youtube URL
async function AddNewSongFromYtUrl(req, res) {
    try {
    } catch (error) {
        logger.error("Lỗi khi thêm bài hát từ URL Youtube:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Get All songs
async function GetAllSongs(req, res) {
    try {
        const songs = await Song.findAll({
            include: [
                {
                    model: Genre,
                    as: "genre",
                    attributes: ["id", "name"],
                },
                {
                    model: Artist,
                    as: "artist",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!songs) {
            return sendError(res, 404, "Không tìm thấy bài hát nào.");
        }
        return sendSuccess(res, 200, {
            message: "Lấy danh sách bài hát thành công.",
            songs: songs,
        });
    } catch (error) {
        logger.error("Lỗi khi lấy danh sách bài hát:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Get song by id
async function GetSongById(req, res) {
    try {
        const songId = req.params.id;
        const song = await Song.findOne({
            where: { id: songId },
            include: [
                {
                    model: Genre,
                    as: "genre",
                    attributes: ["id", "name"],
                },
                {
                    model: Artist,
                    as: "artist",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!song) {
            return sendError(res, 404, "Bài hát không tồn tại.");
        }
        return sendSuccess(res, 200, {
            message: "Lấy thông tin bài hát thành công.",
            song: song,
        });
    } catch (error) {
        logger.error("Lỗi khi lấy bài hát theo id:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Update song
async function UpdateSong(req, res) {
    try {
        const songId = req.params.id;
        const { title, fileUrl, coverUrl, views, genre_id, artist_id } =
            req.body;
        const song = await Song.findOne({ where: { id: songId } });
        if (!song) {
            return sendError(res, 404, "Bài hát không tồn tại.");
        }
        await Song.update(
            {
                title: title,
                fileUrl: fileUrl,
                coverUrl: coverUrl,
                views: views,
                genre_id: genre_id,
                artist_id: artist_id,
            },
            { where: { id: songId } }
        );
        return sendSuccess(res, 200, {
            message: "Cập nhật bài hát thành công.",
        });
    } catch (error) {
        logger.error("Lỗi khi cập nhật bài hát:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Delete song
async function DeleteSong(req, res) {
    try {
        const songId = req.params.id;
        const song = await Song.findOne({ where: { id: songId } });
        if (!song) {
            return sendError(res, 404, "Bài hát không tồn tại.");
        }
        // Delete song file from server (if needed)
        // await deleteFile(song.fileUrl);
        // Delete song from database
        await Song.destroy({ where: { id: songId } });
        return sendSuccess(res, 200, {
            message: "Xóa bài hát thành công.",
        });
    } catch (error) {
        logger.error("Lỗi khi xóa bài hát:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Filter song by name
async function FilterSongByName(req, res) {
    try {
        const name = req.query.name;
        const songs = await Song.findAll({
            where: { title: { [Op.like]: `%${name}%` } },
            include: [
                {
                    model: Genre,
                    as: "genre",
                    attributes: ["id", "name"],
                },
                {
                    model: Artist,
                    as: "artist",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!songs) {
            return sendError(res, 404, "Không tìm thấy bài hát nào.");
        }
        return sendSuccess(res, 200, {
            message: "Lọc bài hát theo tên thành công.",
            songs: songs,
        });
    } catch (error) {
        logger.error("Lỗi khi lọc bài hát theo tên:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// filter song by artist
async function FilterSongByArtist(req, res) {
    try {
        const artistId = req.query.artistId;
        const songs = await Song.findAll({
            where: { artist_id: artistId },
            include: [
                {
                    model: Genre,
                    as: "genre",
                    attributes: ["id", "name"],
                },
                {
                    model: Artist,
                    as: "artist",
                    attributes: ["id", "name"],
                },
            ],
        });
    } catch (error) {
        logger.error("Lỗi khi lọc bài hát theo nghệ sĩ:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Filter song by genre
async function FilterSongByGenre(req, res) {
    try {
        const genreId = req.query.genreId;
        const songs = await Song.findAll({
            where: { genre_id: genreId },
            include: [
                {
                    model: Genre,
                    as: "genre",
                    attributes: ["id", "name"],
                },
                {
                    model: Artist,
                    as: "artist",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!songs) {
            return sendError(res, 404, "Không tìm thấy bài hát nào.");
        }
        return sendSuccess(res, 200, {
            message: "Lọc bài hát theo thể loại thành công.",
            songs: songs,
        });
    } catch (error) {
        logger.error("Lỗi khi lọc bài hát theo thể loại:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}

module.exports = {
    AddNewSongFromDevice,
    AddNewSongFromYtUrl,
    GetAllSongs,
    GetSongById,
    UpdateSong,
    DeleteSong,
    FilterSongByName,
    FilterSongByArtist,
    FilterSongByGenre,
};
