//*******************************************TODO******************* */
//POST /organizations/:org_id/contracts/:contract_id/expenses/:expense_id/expenseEntries
const { sequelize, ExpenseEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')

module.exports = async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        if (!expenseId) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'))
        }
        const body = {
            ...pick(req.body, ['name', 'description', 'quantity', 'unitCost']),
            ExpenseId: expenseId,
            updatedByUserId: req.auth.id,
        }
        await sequelize.transaction(async (transaction) => {
            const expenseEntry = ExpenseEntry.build(body)
            await expenseEntry.save({ transaction })

            res.status(200).json(createSuccessResponse(expenseEntry))
        })
    } catch (err) {
        res.status(500).json(createErrorResponse(err.message))
    }
}
