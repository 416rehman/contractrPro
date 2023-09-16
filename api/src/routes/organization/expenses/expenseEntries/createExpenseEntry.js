const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { sequelize, ExpenseEntry, Expense } = require('../../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')

// create expense entry
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

            const expenseEntry = await ExpenseEntry.create(
                {
                    ...pick(req.body, [
                        'name',
                        'description',
                        'unitCost',
                        'quantity',
                    ]),
                    ExpenseId: expenseId,
                },
                { transaction }
            )

            res.status(200).json(createSuccessResponse(expenseEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
