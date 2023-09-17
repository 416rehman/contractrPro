const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// get expense
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const expenseId = req.params.expense_id

        if (!expenseId) throw new Error('Expense ID is required')

        const expense = await prisma.expense.findUnique({
            where: {
                id: expenseId,
                organizationId: orgId,
            },
            include: {
                ExpenseEntries: true,
            },
        })

        if (!expense) throw new Error('Expense not found')

        res.status(200).json(createSuccessResponse(expense))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}