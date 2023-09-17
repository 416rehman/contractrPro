const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// get invoice
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!invoiceId) throw new Error('Invoice ID is required')

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                organizationId: orgId,
            },
            include: {
                InvoiceEntries: true,
            },
        })

        if (!invoice) throw new Error('Invoice not found')

        res.status(200).json(createSuccessResponse(invoice))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}