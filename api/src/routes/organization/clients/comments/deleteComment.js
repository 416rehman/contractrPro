const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const prisma = require('../../../../prisma')
const s3 = require('../../../../utils/s3')

// Deletes a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const clientId = req.params.client_id
        const orgId = req.params.org_id

        if (!commentId) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        // Delete the comment
        const comment = await prisma.comment.delete({
            where: {
                id: commentId,
                clientId: clientId,
                organizationId: orgId,
            },
            include: {
                Attachments: true,
            },
        })

        // Delete the attachments in one promise
        await Promise.all(
            comment.Attachments.map((attachment) => {
                return s3.delete(attachment.id)
            })
        )

        return res.status(200).json(createSuccessResponse(comment))
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete comment.'))
    }
}