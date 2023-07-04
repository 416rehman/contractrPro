const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { pick } = require('../../../../utils')
const { Invoice, Comment, Attachment, sequelize } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Updates a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid invoice id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        const body = {
            ...pick(req.body, ['content']),
            InvoiceId: invoiceId,
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the invoice belongs to the org
            const invoice = await Invoice.findOne({
                where: { id: invoiceId, OrganizationId: orgId },
                transaction,
            })
            if (!invoice) {
                return res
                    .status(400)
                    .json(createErrorResponse('Invoice not found.'))
            }

            let attachments = null
            // Check if there are any attachments
            if (req.files && req.files.length > 0) {
                // Process attachments
                const attachmentsData = req.files.map((file) => {
                    return {
                        id: file.key,
                        filename: file.originalname,
                        mimetype: file.mimetype,
                        fileSizeBytes: file.size,
                        accessUrl: file.location,
                        CommentId: commentId,
                    }
                })

                // Create the attachments
                attachments = await Attachment.bulkCreate(attachmentsData, {
                    transaction,
                })
                if (!attachments) {
                    return res
                        .status(400)
                        .json(
                            createErrorResponse('Failed to create attachments.')
                        )
                }
            }

            // Update the comment
            const comment = await Comment.update(body, {
                where: {
                    id: commentId,
                    InvoiceId: invoiceId,
                    OrganizationId: orgId,
                },
                transaction,
            })
            if (!comment || comment[0] === 0) {
                console.log(orgId, invoiceId, commentId)
                return res
                    .status(400)
                    .json(createErrorResponse('Failed to update comment.'))
            }

            return res.status(200).json(createSuccessResponse(comment))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
