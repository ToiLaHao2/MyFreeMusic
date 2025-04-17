const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

async function downloadYoutubeAudio(
    ytbURL,
    outputDir = "../songs-storage/original"
) {
    try {
        const id = uuidv4();
        const outputPath = path.join(outputDir, `${id}.mp3`);

        // Tạo thư mục nếu chưa có
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Đảm bảo đường dẫn chính xác tới ffmpeg và yt-dlp
        const ytDlpPath = path.resolve(__dirname, "..", "yt-dlp.exe");
        const ffmpegPath = path.resolve(
            __dirname,
            "..",
            "ffmpeg-7.1.1-essentials_build",
            "bin",
            "ffmpeg.exe"
        );

        // Lệnh yt-dlp
        const command = `"${ytDlpPath}" --ffmpeg-location "${ffmpegPath}" -x --audio-format mp3 -o "${outputPath}" "${ytbURL}"`;

        console.log(`Running command: ${command}`); // Log lệnh đang chạy

        // Sử dụng Promise để chạy lệnh trong exec và chờ kết quả
        const result = await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("YT-DLP error:", stderr); // Log chi tiết lỗi từ stderr
                    return reject(new Error(`YT-DLP error: ${stderr}`));
                }
                if (stdout) {
                    console.log("YT-DLP output:", stdout); // Log thông tin trả về từ stdout
                }
                resolve(outputPath); // Trả về đường dẫn file mp3
            });
        });

        return result;
    } catch (error) {
        console.error("Lỗi khi tải bài hát từ YouTube:", error);
        throw new Error("Không thể tải bài hát từ YouTube.");
    }
}

module.exports = { downloadYoutubeAudio };
