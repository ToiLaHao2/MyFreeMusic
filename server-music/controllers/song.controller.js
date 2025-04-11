// Song controllers

const logger = require("../util/logger");
const { sendError } = require("../util/response");

// Add song from device
async function AddNewSongFromDevice(req, res) {
    try {
    } catch (error) {
        logger.error("Lỗi khi thêm bài hát:", error);
        return sendError(res, 500, "Lỗi hệ thống.");
    }
}
// Add song from Youtube URL
async function AddNewSongFromYtUrl(req, res) {}
// Get All songs
async function GetAllSongs(req, res) {}
// Get song by id
async function GetSongById(req, res) {}
// Update song
async function UpdateSong(req, res) {}
// Delete song
async function DeleteSong(req, res) {}
// Filter song by name
async function FilterSongByName(req, res) {}
// filter song by artist
async function FilterSongByArtist(req, res) {}
// Filter song by genre
async function FilterSongByGenre(req, res) {}
