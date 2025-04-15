// Song controllers

const { Artist } = require("../models/artist.model");
const { Genre } = require("../models/genre.model");
const { Song } = require("../models/song.model");
const logger = require("../util/logger");
const { sendError, sendSuccess } = require("../util/response");
const cloudinary = require("../config/cloudinary.config");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

// Add song from device
const fs = require("fs");
const path = require("path");
const { convertToHLS } = require("../util/hlsHelper");
const { console } = require("inspector");

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
        if (!ytbURL) return sendError(res, 400, "Thiếu URL Youtube.");

        // Lấy metadata qua yt-dlp
        const infoJson = await fetch(
            `https://noembed.com/embed?url=${ytbURL}`
        ).then((res) => res.json());
        const title = infoJson.title;
        const thumbnailUrl = infoJson.thumbnail_url;
        const artistName = infoJson.author_name;

        // Tải file mp3
        const filePath = await downloadYoutubeAudio(ytbURL);

        // 🔽 Chuyển đổi sang HLS (.m3u8)
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-");

        const hlsOutputPath = `songs-storage/hls/${slug}`;
        await convertToHLS(filePath, hlsOutputPath);

        // Upload ảnh bìa lên cloudinary
        const result = await cloudinary.uploader.upload(thumbnailUrl, {
            folder: "music_app/covers",
        });

        const artist = await Artist.findOrCreate({
            where: { name: artistName },
            defaults: {
                name: artistName,
                profile_picture_url: thumbnailUrl,
                biography: "Tự động từ Youtube",
            },
        });

        const genre = await Genre.findOrCreate({
            where: { name: "Youtube Auto" },
            defaults: {
                name: "Youtube Auto",
                description: "Tự động từ Youtube",
            },
        });

        const newSong = await Song.create({
            title: title,
            fileUrl: filePath,
            coverUrl: result.secure_url,
            genre_id: genre[0].id,
            artist_id: artist[0].id,
            source: "YOUTUBE",
        });

        return sendSuccess(res, 200, {
            message: "Thêm bài hát từ Youtube thành công.",
            song: newSong,
        });
    } catch (err) {
        logger.error("Lỗi khi thêm bài hát từ Youtube:", err);
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

// Download Youtube audio

async function downloadYoutubeAudio(url, outputDir = "songs-storage/original") {
    return new Promise((resolve, reject) => {
        const id = uuidv4();
        const outputPath = path.join(outputDir, `${id}.mp3`);

        // Tạo thư mục nếu chưa có
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const command = `"./yt-dlp.exe" --ffmpeg-location "C:/ffmpeg/bin" -x --audio-format mp3 -o "${outputPath}" "${url}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("YT-DLP error:", stderr);
                return reject(error);
            }
            resolve(outputPath);
        });
    });
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
