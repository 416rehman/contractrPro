const { sequelize, Invoice, InvoiceEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// get invoice
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
        }
        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid invoice_id'))
        }

        await sequelize.transaction(async (transaction) => {
            const invoice = await Invoice.findOne({
                where: {
                    OrganizationId: orgId,
                    id: invoiceId,
                },
                transaction,
                include: {
                    model: InvoiceEntry,
                },
            })

            if (!invoice) {
                return res
                    .status(400)
                    .json(createErrorResponse('Invoice not found'))
            }

            res.status(200).json(createSuccessResponse(invoice))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
