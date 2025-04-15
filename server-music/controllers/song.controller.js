// Song controllers

const { Artist } = require("../models/artist.model");
const { Genre } = require("../models/genre.model");
const { Song } = require("../models/song.model");
const logger = require("../util/logger");
const { sendError, sendSuccess } = require("../util/response");
const cloudinary = require("../config/cloudinary.config");
const ytdl = require("ytdl-core");

// Add song from device
const fs = require("fs");
const path = require("path");
const { convertToHLS } = require("../util/hlsHelper");

async function AddNewSongFromDevice(req, res) {
    try {
        const { songTitle, songGenreId, songArtistId } = req.body;
        const songFile = req.files?.songFile?.[0];
        const songCover = req.files?.songCover?.[0];

        if (!songFile || !songCover) {
            return sendError(res, 400, "Thiếu file bài hát hoặc ảnh bìa.");
        }

        // ... kiểm tra artist, genre, validate file ...
        const artist = await Artist.findOne({ where: { id: songArtistId } });
        if (!artist) {
            return sendError(res, 404, "Nghệ sĩ không tồn tại.");
        }
        const genre = await Genre.findOne({ where: { id: songGenreId } });
        if (!genre) {
            return sendError(res, 404, "Thể loại không tồn tại.");
        }
        const allowedTypes = [
            "audio/mpeg",
            "audio/mp3",
            "image/jpeg",
            "image/png",
        ];
        if (!allowedTypes.includes(songFile.mimetype)) {
            return sendError(
                res,
                400,
                "File không hợp lệ (chỉ nhận .mp3, .jpg, .png)"
            );
        }
        if (!allowedTypes.includes(songCover.mimetype)) {
            return sendError(
                res,
                400,
                "File không hợp lệ (chỉ nhận .mp3, .jpg, .png)"
            );
        }
        if (songFile.size > 20 * 1024 * 1024) {
            return sendError(res, 400, "File quá lớn (tối đa 20MB).");
        }
        if (songCover.size > 5 * 1024 * 1024) {
            return sendError(res, 400, "File ảnh bìa quá lớn (tối đa 5MB).");
        }

        const result = await cloudinary.uploader.upload(songCover.path, {
            folder: "music_app/covers",
        });
        const coverUrl = result.secure_url;
        fs.unlinkSync(songCover.path);

        // 🔥 Convert to HLS
        const slug = songTitle
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-");

        const hlsOutputPath = `songs-storage/hls/${slug}`;
        await convertToHLS(songFile.path, hlsOutputPath);

        // ✅ Lưu dữ liệu
        const newSong = await Song.create({
            title: songTitle,
            fileUrl: `${hlsOutputPath}/index.m3u8`,
            coverUrl: coverUrl,
            genre_id: songGenreId,
            artist_id: songArtistId,
            source: "DEVICE",
        });

        return sendSuccess(res, 200, {
            message: "Thêm bài hát thành công.",
            song: newSong,
        });
    } catch (error) {
        logger.error("Lỗi khi thêm bài hát từ thiết bị:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Add song from Youtube URL
async function AddNewSongFromYtUrl(req, res) {
    try {
        const { ytbURL } = req.body;
        if (!ytbURL) {
            return sendError(res, 400, "Thiếu URL Youtube.");
        }
        // Validate URL (có thể dùng thư viện như validator.js hoặc regex)
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!regex.test(ytbURL)) {
            return sendError(res, 400, "URL không hợp lệ.");
        }
        // Lấy thông tin video từ Youtube (có thể dùng thư viện youtube-dl hoặc ytdl-core)
        const info = await ytdl.getInfo(ytbURL);
        const title = info.videoDetails.title;
        const thumbnailUrl = info.videoDetails.thumbnails[0].url;
        const videoId = info.videoDetails.videoId;
        // Lấy thông tin artist
        const artistName = info.videoDetails.author.name;
        const artist = await Artist.findOne({
            where: { name: artistName },
        });
        if (!artist) {
            // thêm thông tin artist vào cơ sở dữ liệu nếu không tồn tại
            // Có thể thêm artist_id vào bài hát sau này
            // tạo một artist mặc định nếu không tìm thấy
            // artist = await Artist.create({
            //     name: artistName,
            //     avatarUrl: thumbnailUrl,
            //     source: "YOUTUBE",
            // });
            // Hoặc có thể tạo một artist mặc định nếu không tìm thấy
            artist = await Artist.create({
                name: "Artist Default",
                profile_picture_url: thumbnailUrl,
                biography: "YOUTUBE",
            });
            // return sendError(res, 404, "Nghệ sĩ không tồn tại.");
        }
        // Lấy thông tin genre
        const genreName = info.videoDetails.category;
        const genre = await Genre.findOne({
            where: { name: genreName },
        });
        if (!genre) {
            // thêm thông tin genre vào cơ sở dữ liệu nếu không tồn tại
            // Có thể thêm genre_id vào bài hát sau này
            // tạo một genre mặc định nếu không tìm thấy
            // genre = await Genre.create({
            //     name: genreName,
            //     source: "YOUTUBE",
            // });
            // Hoặc có thể tạo một genre mặc định nếu không tìm thấy
            genre = await Genre.create({
                name: "Genre Default",
                description: "YOUTUBE",
            });
            // return sendError(res, 404, "Thể loại không tồn tại.");
        }
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-");
        const hlsOutputPath = `songs-storage/hls/${slug}`;
        await convertToHLS(`ytb://video/${videoId}`, hlsOutputPath);
        // Upload thumbnail to Cloudinary
        const result = await cloudinary.uploader.upload(thumbnailUrl, {
            folder: "music_app/covers",
        });
        const coverUrl = result.secure_url;
        // Lưu bài hát vào cơ sở dữ liệu
        const newSong = await Song.create({
            title: title,
            fileUrl: `${hlsOutputPath}/index.m3u8`,
            coverUrl: coverUrl,
            genre_id: genre.id,
            artist_id: artist.id, // Có thể thêm artist sau
            source: "YOUTUBE",
        });
        return sendSuccess(res, 200, {
            message: "Thêm bài hát từ URL Youtube thành công.",
            song: newSong,
        });
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
