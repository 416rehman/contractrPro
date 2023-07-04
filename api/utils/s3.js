const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3')

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
    },
})

module.exports.upload = async (file, key) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    }

    return await s3Client.send(new PutObjectCommand(params))
}

module.exports.delete = async (key) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
    }

    return await s3Client.send(new DeleteObjectCommand(params))
}

module.exports.getSignedUrl = async (key) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: 60 * 5, // 5 minutes
    }

    return await s3Client.getSignedUrlPromise('getObject', params)
}

module.exports.s3Client = s3Client
