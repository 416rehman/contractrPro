const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { pick } = require('../../../../utils')
const { Expense, Comment, Attachment, sequelize } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

module.exports = async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!expenseId || !isValidUUID(expenseId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid expense id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        const body = {
            ...pick(req.body, ['content']),
            ExpenseId: expenseId,
            AuthorId: req.auth.id,
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the expense belongs to the org
            const expense = await Expense.findOne({
                where: { id: expenseId, OrganizationId: orgId },
                transaction,
            })
            if (!expense) {
                return res
                    .status(400)
                    .json(createErrorResponse('Expense not found.'))
            }

            // Create the comment
            const comment = await Comment.create(body, { transaction })
            if (!comment) {
                return res
                    .status(400)
                    .json(createErrorResponse('Failed to create comment.'))
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
                        CommentId: comment.id,
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

            comment.dataValues.Attachments = attachments

            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', error))
    }
}
