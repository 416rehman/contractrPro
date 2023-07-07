const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { sequelize, InvoiceEntry, Invoice } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')

// create invoice entry
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

        await sequelize.transaction(async (transaction) => {
            // make sure the invoice belongs to the org
            const invoice = await Invoice.findOne({
                where: {
                    id: invoiceId,
                    OrganizationId: orgId,
                },
                transaction,
            })
            if (!invoice) {
                throw new Error('Invoice not found')
            }

            const invoiceEntry = await InvoiceEntry.create(
                {
                    ...pick(req.body, [
                        'name',
                        'description',
                        'unitCost',
                        'quantity',
                    ]),
                    InvoiceId: invoiceId,
                },
                { transaction }
            )

            res.status(200).json(createSuccessResponse(invoiceEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
