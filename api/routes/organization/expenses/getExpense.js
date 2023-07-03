const { sequelize, Expense, ExpenseEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// get org expense
module.exports = async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
        }
        if (!expenseId || !isValidUUID(expenseId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid expense_id'))
        }

        await sequelize.transaction(async (transaction) => {
            const expense = await Expense.findOne({
                where: {
                    OrganizationId: orgId,
                    id: expenseId,
                },
                transaction,
                include: {
                    model: ExpenseEntry,
                },
            })

            if (!expense) {
                return res
                    .status(400)
                    .json(createErrorResponse('Expense not found'))
            }

            res.status(200).json(createSuccessResponse(expense))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
