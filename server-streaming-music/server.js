const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

app.use(cors());

// Serve static HLS files
app.use("/hls", express.static(path.join(__dirname, "hls")));

app.listen(4000, () => {
    console.log("🎧 Streaming server running at http://localhost:4000");
});
