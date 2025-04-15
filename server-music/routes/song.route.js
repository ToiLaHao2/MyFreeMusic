const express = require("express");
const { AddNewSongFromDevice } = require("../controllers/song.controller");
const songRouter = express.Router();

songRouter.post("/addNewSongFromDevice", AddNewSongFromDevice);

module.exports = songRouter;
