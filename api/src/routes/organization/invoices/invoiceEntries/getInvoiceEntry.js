const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { InvoiceEntry, Invoice } = require('../../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// get invoice entry
module.exports = async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const invoiceEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
        }

        if (!invoiceEntryId || !isValidUUID(invoiceEntryId)) {
            return res
                .status(400)
                .json(createErrorResponse('InvoiceEntry ID is required'))
        }

        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice ID is required'))
        }
        // make sure the invoice belongs to the org
        const invoice = await Invoice.findOne({
            where: {
                id: invoiceId,
                OrganizationId: orgId,
            },
        })
        if (!invoice) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice not found'))
        }

        const invoiceEntry = await InvoiceEntry.findOne({
            where: {
                InvoiceId: invoiceId,
                id: invoiceEntryId,
            },
        })

        if (!invoiceEntry) {
            return res
                .status(400)
                .json(createErrorResponse('InvoiceEntry not found'))
        }

        res.status(200).json(createSuccessResponse(invoiceEntry))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
