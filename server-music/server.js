const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const db = require("./config/db.config");
const Sequelize = require("sequelize");
const songRouter = require("./routes/song.route");

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Connect to MySQL database
const sequelize = new Sequelize(db.DB_NAME, db.DB_USER, db.DB_PASSWORD, {
    host: db.DB_HOST,
    dialect: db.DIALECT,
});
sequelize
    .authenticate()
    .then(() => {
        console.log("Kết nối đến MySQL thành công!");
    })
    .catch((err) => {
        console.error("Không thể kết nối đến MySQL:", err);
    });

// Routes
app.use("/api/song", songRouter);
// app.use("/api/user", (req, res) => {
//     res.send("Đây là API người dùng");
// });

app.get("/", (req, res) => {
    res.send("Đây là server Express 🎶");
});

app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
});
