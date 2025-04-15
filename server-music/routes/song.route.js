const express = require("express");
const {
    AddNewSongFromDevice,
    AddNewSongFromYtUrl,
} = require("../controllers/song.controller");
const songRouter = express.Router();

songRouter.post("/addNewSongFromDevice", AddNewSongFromDevice);
songRouter.post("/addNewSongFromYtUrl", AddNewSongFromYtUrl);

module.exports = songRouter;
