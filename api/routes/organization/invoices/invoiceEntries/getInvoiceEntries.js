const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { InvoiceEntry, Invoice } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// get invoice entries
module.exports = async (req, res) => {
    try {
        const invoiceId = req.params.invoice_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
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

        const invoiceEntries = await InvoiceEntry.findAll({
            where: {
                InvoiceId: invoiceId,
            },
        })

        res.status(200).json(createSuccessResponse(invoiceEntries))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
