import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ffmpegPath from 'ffmpeg-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function compressVideo(inputFilePath) {
    return new Promise((resolve, reject) => {
        const outputDir = path.join(__dirname, '../uploads/compressedVideos');
        ensureDirExists(outputDir);

        const outputFilePath = path.join(outputDir, Date.now() + '.mp4');
        let newpath = path.join(__dirname, inputFilePath);

        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg(inputFilePath)
            .output(outputFilePath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .audioBitrate('128k')
            .videoBitrate('1000k')
            .on('end', () => resolve(outputFilePath))
            .on('error', (err) => reject(err))
            .run();
    });
}

function compressImage(inputFilePath) {
    return new Promise((resolve, reject) => {
        const outputDir = path.join(__dirname, '../uploads/compressedImages');
        ensureDirExists(outputDir);

        const outputFilePath = path.join(outputDir, Date.now() + '.webp');

        sharp(inputFilePath)
            .resize(1024)
            .webp({ quality: 100 })
            .toFile(outputFilePath, (err) => {
                if (err) reject(err);
                else resolve(outputFilePath);
            });
    });
}

export { compressVideo, compressImage };
