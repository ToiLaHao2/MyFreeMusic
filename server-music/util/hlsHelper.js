const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

async function convertToHLS(inputPath, outputDir) {
    return new Promise((resolve, reject) => {
        const ffmpegPath = path.resolve(
            __dirname,
            "..",
            "ffmpeg-7.1.1-essentials_build",
            "bin",
            "ffmpeg.exe"
        );

        ffmpeg(inputPath)
            .setFfmpegPath(ffmpegPath)
            .addOptions([
                "-profile:v baseline", // Đảm bảo tương thích
                "-level 3.0", // Thiết lập mức độ
                "-start_number 0", // Số bắt đầu cho các tệp .ts
                "-hls_time 10", // Thời gian mỗi đoạn .ts là 10 giây
                "-hls_list_size 0", // Không giới hạn số lượng đoạn
                "-f hls", // Định dạng HLS
                "-c:a aac", // Chuyển đổi âm thanh thành AAC (cần cho phát trực tuyến)
            ])
            .output(`${outputDir}/index.m3u8`) // Tạo tệp .m3u8
            .on("end", () => resolve(true)) // Khi hoàn tất
            .on("error", (err) => {
                console.error("Error during HLS conversion:", err); // Log lỗi
                reject(err); // Trả về lỗi nếu có vấn đề
            })
            .run();
    });
}

module.exports = { convertToHLS };
