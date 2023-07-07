// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id/invoiceEntries/:expenseEntry_id
const { sequelize, ExpenseEntry, Expense } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')

module.exports = async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const expenseEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
        }

        if (!expenseId || !isValidUUID(expenseId)) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'))
        }

        if (!expenseEntryId || !isValidUUID(expenseEntryId)) {
            return res
                .status(400)
                .json(createErrorResponse('ExpenseEntry ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the expense belongs to the org
            const result = await Expense.findOne({
                where: {
                    id: expenseId,
                    OrganizationId: orgId,
                },
                transaction,
            })
            if (!result) {
                throw new Error('ExpenseEntry not found')
            }

            const rowsDeleted = await ExpenseEntry.destroy({
                where: {
                    ExpenseId: expenseId,
                    id: expenseEntryId,
                },
                transaction,
            })
            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('ExpenseEntry not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
