const multer = require('multer')

const upload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB per file
    },
})

module.exports = upload.array('attachments', 10)
