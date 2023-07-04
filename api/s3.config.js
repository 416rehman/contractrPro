const { S3Client } = require('@aws-sdk/client-s3')

module.exports = new S3Client({
    region: 'ca-central-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
    },
})
