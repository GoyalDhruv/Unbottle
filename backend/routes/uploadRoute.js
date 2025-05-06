import express from 'express';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { compressVideo, compressImage } from '../utils/compressionUtils.js';
import uploadMiddleware from '../middleware/multer.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import path from 'path';
import multer from 'multer';
const router = express.Router();

const upload = uploadMiddleware();

router.post(
    "/uploadFiles",
    authMiddleware,
    upload.array("files"),
    async (req, res, next) => {
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
                message: 'Files uploaded and compressed successfully',
                files: uploadResults,
            });

        } catch (error) {
            next(error);
        }
    },
    (err, req, res, next) => {
        console.error('Upload error:', err);

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'File size too large. Maximum allowed is 25MB' });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({ error: 'Too many files uploaded' });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ error: 'Unexpected file type' });
            }
            return res.status(400).json({ error: 'File upload error' });
        } else if (err) {
            if (err.message === 'Only image and video files are allowed!') {
                return res.status(400).json({ error: err.message });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
);


export default router;
