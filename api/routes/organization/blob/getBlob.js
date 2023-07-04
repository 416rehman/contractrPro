const { createErrorResponse } = require('../../../utils/response')
const { Attachment, Comment } = require('../../../db')
const s3 = require('../../../s3.config')
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const { isValidUUID } = require('../../../utils/isValidUUID')

// Gets a blob - can provide a ?download=true query param to download the blob
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const blobId = req.params.blob_id
        const { download } = req.query

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        if (!isValidUUID(blobId)) {
            return res.status(400).json(createErrorResponse('Invalid blob id.'))
        }

        // make sure the attachment belongs to the org
        const attachment = await Attachment.findOne({
            where: { id: blobId },
            include: [
                {
                    model: Comment,
                    where: { OrganizationId: orgId },
                },
            ],
        })
        if (!attachment) {
            return res.status(400).json(createErrorResponse('Blob not found.'))
        }

        const actualFileName = attachment.filename

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: attachment.id,
        })
        const data = await s3.send(command)
        if (!data) {
            return res
                .status(400)
                .json(createErrorResponse('Failed to get blob.'))
        }

        res.writeHead(200, {
            'Content-Type': attachment.mimetype,
            'Content-Length': data.ContentLength,
            'Content-Disposition': download
                ? `attachment; filename=${actualFileName}`
                : `inline; filename=${actualFileName}`,
        })
        data.Body.pipe(res)
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get blob.'))
    }
}
