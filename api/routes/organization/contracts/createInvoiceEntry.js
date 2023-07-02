//*******************************************TODO******************* */
//POST route: /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id
const { sequelize, InvoiceEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')

module.exports = async (req, res) => {
    const invoiceId = req.params.invoice_id
    try {
        const body = {
            ...pick(req.body, [
                'name',
                'description',
                'quantity',
                'unitCost',
            ]),
            InvoiceId: invoiceId,
            updatedByUserId: req.auth.id,
        }
        await sequelize.transaction(async (transaction) => {
            const invoiceEntry = InvoiceEntry.build(body)
            await invoiceEntry.save({ transaction })

            res.status(200).json(createSuccessResponse(invoiceEntry))
        })
    } catch (err) {
        res.status(500).json(createErrorResponse(err.message))
    }
}