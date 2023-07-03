const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { sequelize, ExpenseEntry, Expense } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')

// update expense entry
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
            const expenseEntry = await Expense.findOne({
                where: {
                    id: expenseId,
                    OrganizationId: orgId,
                },
            })

            if (!expenseEntry) {
                return res
                    .status(400)
                    .json(createErrorResponse('ExpenseEntry not found'))
            }

            const [rowsUpdated, [updatedExpenseEntry]] =
                await ExpenseEntry.update(
                    {
                        ...pick(req.body, [
                            'name',
                            'description',
                            'unitCost',
                            'quantity',
                        ]),
                    },
                    {
                        where: {
                            ExpenseId: expenseId,
                            id: expenseEntryId,
                        },
                        returning: true,
                        transaction,
                    }
                )

            if (!rowsUpdated) {
                return res
                    .status(400)
                    .json(createErrorResponse('ExpenseEntry not found'))
            }

            res.status(200).json(createSuccessResponse(updatedExpenseEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
