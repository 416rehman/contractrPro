import multer from 'multer';

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB per file
    },
});

export default upload.array('Attachments', 10);
