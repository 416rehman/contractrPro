const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { Expense, Comment, sequelize } = require('../../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Deletes a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!expenseId || !isValidUUID(expenseId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid expense id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
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

            // Delete the comment
            const comment = await Comment.destroy({
                where: {
                    id: commentId,
                    ExpenseId: expenseId,
                    OrganizationId: orgId,
                },
                transaction,
            })

            return res.status(200).json(createSuccessResponse(comment))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete comment.'))
    }
}
