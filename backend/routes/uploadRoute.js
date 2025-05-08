import express from 'express';
import uploadMiddleware from '../middleware/multer.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadFile } from '../controllers/uploadController.js';
const router = express.Router();

const upload = uploadMiddleware();

router.post("/uploadFiles", authMiddleware, upload.array("files"), uploadFile);


export default router;
