//*******************************************TODO******************* */
// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id/expenseEntries/:expenseEntry_id
const { sequelize, ExpenseEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

module.exports = async (req, res) => {
    const expenseId = req.params.expense_id
    const expenseEntryId = req.params.expenseEntry_id
    try {
        if (!expenseId) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'))
        }

        if (!expenseEntryId) {
            return res
                .status(400)
                .json(createErrorResponse('ExpenseEntry ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const expenseEntryId = await ExpenseEntry.findOne({
                where: {
                    ExpenseId: expenseId,
                    id: expenseEntryId,
                },
                transaction,
            })

            if (!expenseEntryId) {
                throw new Error(`expenseEntry ${expenseEntryId} not exist`)
            }

            await expenseEntryId.destroy({
                transaction,
            })

            return res
                .status(200)
                .json(
                    createSuccessResponse(
                        `ExpenseEntry ${expenseEntryId} has been deleted successfully`
                    )
                )
        })
    } catch (err) {
        return res.status(500).json(createErrorResponse(err.message))
    }
}
