//*******************************************TODO******************* */
// PUT /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id

const { sequelize, Invoice } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const invoiceId = req.params.invoice_id

        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!contractId) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID is required'))
        }

        if (!invoiceId) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice ID is required'))
        }

        const body = {
            ...pick(req.body, [
                'invoiceNumber',
                'invoiceDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
            ]),
            updatedByUserId: req.auth.id,
            OrganizationId: orgId,
            ContractId: contractId,
        }

        await sequelize.transaction(async (transaction) => {
            const queryResult = await Invoice.update(body, {
                where: {
                    OrganizationId: orgId,
                    ContractId: contractId,
                    id: invoiceId,
                },
                transaction,
                returning: true,
            })

            if (!queryResult[0]) {
                throw new Error('Invoice not found')
            }

            const updatedInvoice = queryResult[1][0]
            return res.status(200).json(createSuccessResponse(updatedInvoice))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
