// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id
const { sequelize, Expense } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const expenseId = req.params.expense_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!expenseId || !isValidUUID(expenseId)) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const rowsDeleted = await Expense.destroy({
                where: {
                    OrganizationId: orgId,
                    id: expenseId,
                },
                transaction,
            })
            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('Expense not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
