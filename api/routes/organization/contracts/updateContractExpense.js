//*******************************************TODO******************* */
// PUT /organizations/:org_id/contracts/:contract_id/expenses/:expense_id
const { sequelize, Expense } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
const { isValidUUID } = require('../../../utils/isValidUUID')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const expenseId = req.params.expense_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'))
        }

        if (!expenseId || !isValidUUID(expenseId)) {
            return res
                .status(400)
                .json(createErrorResponse('Expense ID is required'))
        }
        const body = {
            ...pick(req.body, ['description', 'date']),
            updatedByUserId: req.auth.id,
            OrganizationId: orgId,
            ContractId: contractId,
        }

        await sequelize.transaction(async (transaction) => {
            const queryResult = await Expense.update(body, {
                where: {
                    OrganizationId: orgId,
                    ContractId: contractId,
                    id: expenseId,
                },
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Expense not found')
            }

            const updatedExpense = queryResult[1][0]
            return res.status(200).json(createSuccessResponse(updatedExpense))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
