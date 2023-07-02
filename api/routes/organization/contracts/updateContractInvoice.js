//*******************************************TODO******************* */
// PUT /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id

const { sequelize, Invoice } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')

module.exports = async (req, res) => {
    const orgId = req.params.org_id
    const contractId = req.params.contract_id
    const invoiceId = req.params.invoice_id

    try {
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
        }

        await sequelize.transaction(async (transaction) => {
            // Find the expense
            const invoice = await Invoice.findOne({
                where: {
                    id: invoiceId,
                    ContractId: contractId,
                    OrganizationId: orgId,
                },
                transaction,
            })

            if (!invoice) {
                return res
                    .status(404)
                    .json(
                        createErrorResponse(`Expense ${contractId} not exist`)
                    )
            }

            // Update the expense
            await invoice.update(body, { transaction })

            return res
                .status(200)
                .json(
                    createSuccessResponse(
                        `Invoice ${invoiceId} and related entries updated successfully`
                    )
                )
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(error.message))
    }
}
