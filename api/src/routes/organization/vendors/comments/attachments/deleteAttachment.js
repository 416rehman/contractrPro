const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const s3 = require('../../../../../utils/s3')
const prisma = require('../../../../../prisma')

// delete attachment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const vendorId = req.params.vendor_id
        const orgId = req.params.org_id
        const attachmentId = req.params.attachment_id

        if (!commentId) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!attachmentId) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid attachment id.'))
        }

        const comment = await prisma.comment.findFirst({
            where: {
                id: commentId,
                vendorId,
                organizationId: orgId,
            },
            include: {
                Attachments: true,
            },
        })

        if (!comment) {
            return res
                .status(404)
                .json(createErrorResponse('Comment not found.'))
        }

        // if the comment has no content and this is the last attachment, delete the entire comment
        if (
            (!comment.content || comment.content === '') &&
            comment.Attachments.length === 1
        ) {
            prisma.comment.delete({
                where: {
                    id: commentId,
                    vendorId,
                    organizationId: orgId,
                },
            })
        } else {
            await prisma.attachment.delete({
                where: {
                    id: attachmentId,
                },
            })
        }

        await s3.delete(attachmentId)

        return res.status(200).json(createSuccessResponse())
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete attachment.', err))
    }
}