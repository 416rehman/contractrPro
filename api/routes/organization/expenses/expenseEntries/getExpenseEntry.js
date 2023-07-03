const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { ExpenseEntry, Expense } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// get expense entry
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
        // make sure the expense belongs to the org
        const result = await Expense.findOne({
            where: {
                id: expenseId,
                OrganizationId: orgId,
            },
        })
        if (!result) {
            return res
                .status(400)
                .json(createErrorResponse('Expense not found'))
        }

        const expenseEntry = await ExpenseEntry.findOne({
            where: {
                ExpenseId: expenseId,
                id: expenseEntryId,
            },
        })

        if (!expenseEntry) {
            return res
                .status(400)
                .json(createErrorResponse('ExpenseEntry not found'))
        }

        res.status(200).json(createSuccessResponse(expenseEntry))
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
