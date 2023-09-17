const { createErrorResponse } = require('../../../utils/response')
const prisma = require('../../../prisma')
const s3 = require('../../../utils/s3')

// Gets a blob - can provide a ?download=true query param to download the blob
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const blobId = req.params.blob_id
        const { download } = req.query

        if (!blobId) throw new Error('Blob ID is required.')
        if (!orgId) throw new Error('Organization ID is required.')

        // make sure the attachment belongs to the org
        const attachment = prisma.attachment.findFirst({
            where: {
                id: blobId,
                Comment: {
                    organizationId: orgId,
                },
            },
        })

        if (!attachment) throw new Error('Blob not found.')

        const actualFileName = attachment.name

        const data = await s3.get(blobId)
        if (!data) throw new Error('Failed to get blob.')
        else {
            res.writeHead(200, {
                'Content-Type': attachment.type,
                'Content-Length': data.ContentLength,
                'Content-Disposition': download
                    ? `attachment; filename=${actualFileName}`
                    : `inline; filename=${actualFileName}`,
            })
            data.Body.pipe(res)
        }
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get blob.', error))
    }
}