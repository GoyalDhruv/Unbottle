import path from 'path';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { compressVideo, compressImage } from '../utils/compressionUtils.js';

export const uploadFile = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    try {
        const uploadResults = [];

        for (const file of req.files) {
            let compressedFilePath;

            if (file.mimetype.startsWith('image/')) {
                compressedFilePath = await compressImage(file.buffer);
            } else if (file.mimetype.startsWith('video/')) {
                const tempVideoPath = path.join('uploads', `${Date.now()}-temp.mp4`);
                await fs.promises.writeFile(tempVideoPath, file.buffer);
                compressedFilePath = await compressVideo(tempVideoPath);
                await fs.promises.unlink(tempVideoPath);
            }

            const cloudinaryResult = await cloudinary.uploader.upload(compressedFilePath, {
                folder: 'unbottle',
                resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
            });

            await fs.promises.unlink(compressedFilePath);

            uploadResults.push({
                originalName: file.originalname,
                public_id: cloudinaryResult.public_id,
                url: cloudinaryResult.secure_url,
            });
        }

        res.status(200).json({
            message: 'Files uploaded successfully',
            files: uploadResults,
        });

    } catch (error) {
        console.error('Upload error:', err);
    }
}