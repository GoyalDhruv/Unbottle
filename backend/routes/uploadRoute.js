import express from 'express';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { compressVideo, compressImage } from '../utils/compressionUtils.js';
import uploadMiddleware from '../middleware/multer.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import path from 'path';
const router = express.Router();


const upload = uploadMiddleware();

router.post("/uploadFile", authMiddleware, upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    let compressedFilePath;

    try {
        if (req.file.mimetype.startsWith('image/')) {
            compressedFilePath = await compressImage(req.file.buffer);
        } else if (req.file.mimetype.startsWith('video/')) {
            const tempVideoPath = path.join('uploads', `${Date.now()}-temp.mp4`);
            await fs.promises.writeFile(tempVideoPath, req.file.buffer);
            compressedFilePath = await compressVideo(tempVideoPath);
            await fs.promises.unlink(tempVideoPath);
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        const cloudinaryResult = await cloudinary.uploader.upload(compressedFilePath, {
            folder: 'unbottle',
            resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
        });

        await fs.promises.unlink(compressedFilePath);

        res.status(200).json({
            message: 'File uploaded and compressed successfully',
            public_id: cloudinaryResult.public_id,
            url: cloudinaryResult.secure_url,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;
