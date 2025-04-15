const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Đây là server Express 🎶");
});

app.listen(3000, () => {
    console.log("Express server running on http://localhost:3000");
});
