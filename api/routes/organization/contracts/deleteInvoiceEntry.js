//*******************************************TODO******************* */
// DELETE /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id/invoiceEntries/:invoiceEntry_id
const { sequelize, Invoice } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
module.exports = async (req, res) => {
    const invoiceId = req.params.invoice_id
    const invoiceEntryId = req.params.invoiceEntry_id
    try {
        if (!invoiceId) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice ID is required'))
        }

        if (!invoiceEntryId) {
            return res
                .status(400)
                .json(createErrorResponse('InvoiceEntry ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const invoiceEntry = await Invoice.findOne({
                where: {
                    InvoiceId: invoiceId,
                    id: invoiceEntryId,
                },
                transaction,
            })

            if (!invoiceEntry) {
                throw new Error(`InvoiceEntry ${invoiceEntryId} not exist`)
            }

            await invoiceEntry.destroy({
                transaction,
            })

            return res
                .status(200)
                .json(
                    createSuccessResponse(
                        `InvoiceEntry ${invoiceEntryId} has been deleted successfully`
                    )
                )
        })
    } catch (err) {
        return res.status(500).json(createErrorResponse(err.message))
    }
}
