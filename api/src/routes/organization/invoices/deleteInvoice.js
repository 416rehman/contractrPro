const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const s3 = require('../../../utils/s3')

module.exports = async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        const deleted = await prisma.invoice.delete({
            where: {
                id: invoiceId,
                organizationId: orgId,
            },
            // Includes so we can delete all attachments from S3
            include: {
                Comments: {
                    include: {
                        Attachments: true,
                    },
                },
            },
        })

        if (!deleted) {
            throw new Error('invoice not found.')
        }

        // Delete all comment attachments
        const commentAttachments = deleted.Comments.map((comment) => {
            return comment.Attachments
        }).flat()

        await Promise.all(
            commentAttachments.map(async (attachment) => {
                return s3.delete(attachment.id)
            })
        )

        res.status(200).json(createSuccessResponse(deleted))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}