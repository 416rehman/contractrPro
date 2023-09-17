const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { zExpenseEntry, zExpense } = require('../../../validators/expense.zod')

module.exports = async (req, res) => {
    try {
        const { org_id, expense_id } = req.params

        if (!expense_id) throw new Error('Expense ID is required')

        const ExpenseEntries =
            req.body?.ExpenseEntries?.map((entry) =>
                zExpenseEntry
                    .pick({
                        description: true,
                        quantity: true,
                        unitPrice: true,
                        unit: true,
                        name: true,
                    })
                    .parse(entry)
            ) || []

        if (ExpenseEntries.length === 0)
            throw new Error(
                'ExpenseEntries is required. Provide at least one entry, like this: { "ExpenseEntries": [{ "description": "some description", "quantity": 1, "unitPrice": 100, "name": "some name" }] }'
            )

        const data = zExpense.parse(req.body)
        data.ExpenseEntries = {
            set: ExpenseEntries,
        }
        data.organizationId = org_id
        data.updatedByUserId = req.auth.id

        const updatedExpense = await prisma.expense.update({
            where: {
                id: expense_id,
                organizationId: org_id,
            },
            data,
            include: {
                ExpenseEntries: true,
            },
        })

        res.status(200).json(createSuccessResponse(updatedExpense))
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}