const express = require("express");
const app = express();
const { Sequelize } = require("sequelize");
const { initSong } = require("./models/song.model");
const { initArtist } = require("./models/artist.model");
const { initGenre } = require("./models/genre.model");
const songRouter = require("./routes/song.route");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Tạo instance sequelize
const sequelize = new Sequelize({
    dialect: "mysql", // Thay bằng cơ sở dữ liệu của bạn
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false, // Tắt log query nếu không cần
});

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

// Khởi tạo các mô hình
initSong(sequelize);
initArtist(sequelize);
initGenre(sequelize);

// Đồng bộ hóa cơ sở dữ liệu
sequelize
    .sync({ force: false }) // `force: true` sẽ xóa các bảng cũ nếu chúng đã tồn tại
    .then(() => {
        console.log("Các bảng đã được tạo thành công.");
    })
    .catch((err) => {
        console.error("Không thể tạo bảng:", err);
    });

// Routes
app.use("/api/song", songRouter);

app.get("/", (req, res) => {
    res.send("Đây là server Express 🎶");
});

app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
});
