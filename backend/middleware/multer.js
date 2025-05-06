import multer from 'multer';

function uploadMiddleware() {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 25 * 1024 * 1024,
        },
    });
}

export default uploadMiddleware;
