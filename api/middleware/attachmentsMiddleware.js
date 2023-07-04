const UUID = require('uuid')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = require('../s3.config')

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname })
        },
        key: function (req, file, cb) {
            const uuid = UUID.v4(Date.now().toString() + file.originalname)
            cb(null, uuid)
        },
    }),
    limits: {
        fileSize: 1024 * 1024 * 10, // 10 MB per file
    },
})

module.exports = upload.array('attachments', 10)
