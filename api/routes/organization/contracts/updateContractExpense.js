//*******************************************TODO******************* */
// PUT /organizations/:org_id/contracts/:contract_id/expenses/:expense_id
const { sequelize, Expense } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')

module.exports = async (req, res) => {
    const orgId = req.params.org_id
    const contractId = req.params.contract_id
    const expenseId = req.params.expense_id
    try {
        const body = {
            ...pick(req.body, ['description', 'date']),
            updatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            // Find the expense
            const expense = await Expense.findOne({
                where: {
                    id: expenseId,
                    ContractId: contractId,
                    OrganizationId: orgId,
                },
                transaction,
            })

            if (!expense) {
                return res
                    .status(404)
                    .json(createErrorResponse(`Expense ${expenseId} not exist`))
            }

            // Update the expense
            await expense.update(body, { transaction })

            return res
                .status(200)
                .json(
                    createSuccessResponse(
                        `Expense ${expenseId} and related entries updated successfully`
                    )
                )
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
