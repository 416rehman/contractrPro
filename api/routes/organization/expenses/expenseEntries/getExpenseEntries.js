const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { ExpenseEntry, Expense } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// get expense entries
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
                .json(createErrorResponse('Expense ID is required'))
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
                .json(createErrorResponse('ExpenseEntry not found'))
        }
        const expenseEntries = await ExpenseEntry.findAll({
            where: {
                ExpenseId: expenseId,
            },
        })

        res.status(200).json(createSuccessResponse(expenseEntries))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
