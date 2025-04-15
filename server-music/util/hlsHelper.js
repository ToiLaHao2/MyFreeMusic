const ffmpeg = require("fluent-ffmpeg");

async function convertToHLS(inputPath, outputDir) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .addOptions([
                "-profile:v baseline",
                "-level 3.0",
                "-start_number 0",
                "-hls_time 10",
                "-hls_list_size 0",
                "-f hls",
            ])
            .output(`${outputDir}/index.m3u8`)
            .on("end", () => resolve(true))
            .on("error", (err) => reject(err))
            .run();
    });
}

module.exports = {
    convertToHLS,
};
