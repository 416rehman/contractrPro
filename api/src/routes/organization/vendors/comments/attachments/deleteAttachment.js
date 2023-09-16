const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const { Comment, Attachment, sequelize } = require('../../../../../../db')
const { isValidUUID } = require('../../../../../utils/isValidUUID')

// delete attachment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const vendorId = req.params.vendor_id
        const orgId = req.params.org_id
        const attachmentId = req.params.attachment_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!vendorId || !isValidUUID(vendorId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid vendor id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        if (!attachmentId || !isValidUUID(attachmentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid attachment id.'))
        }

        await sequelize.transaction(async (transaction) => {
            // Make sure the Comment belongs to the Vendor
            const comment = await Comment.findOne({
                where: {
                    id: commentId,
                    OrganizationId: orgId,
                    VendorId: vendorId,
                },
            })
            if (!comment) {
                return res
                    .status(400)
                    .json(createErrorResponse('Attachment not found.'))
            }

            // Find all attachments for the comment
            const attachments = await Attachment.findAll({
                where: {
                    CommentId: commentId,
                },
                transaction,
            })

            let rowsDeleted = 0

            // if the comment has no content and this is the last attachment, delete the comment
            if (
                (!comment.content || comment.content === '') &&
                attachments.length === 1
            ) {
                rowsDeleted = await comment.destroy({ transaction })
                rowsDeleted += 1 // add 1 for the attachment
            } else {
                for (const attachment of attachments) {
                    if (attachment.id === attachmentId) {
                        rowsDeleted = await attachment.destroy({ transaction })
                        break
                    }
                }
            }

            return res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete attachment.', err))
    }
}
