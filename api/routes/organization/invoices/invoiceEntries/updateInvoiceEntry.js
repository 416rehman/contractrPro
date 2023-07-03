const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { sequelize, InvoiceEntry, Invoice } = require('../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')

// update invoice entry
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

        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice ID is required'))
        }

        if (!invoiceEntryId || !isValidUUID(invoiceEntryId)) {
            return res
                .status(400)
                .json(createErrorResponse('InvoiceEntry ID is required'))
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

            const [rowsUpdated, [updatedInvoiceEntry]] =
                await InvoiceEntry.update(
                    {
                        ...pick(req.body, [
                            'name',
                            'description',
                            'unitCost',
                            'quantity',
                        ]),
                    },
                    {
                        where: {
                            InvoiceId: invoiceId,
                            id: invoiceEntryId,
                        },
                        returning: true,
                        transaction,
                    }
                )

            if (!rowsUpdated) {
                return res
                    .status(400)
                    .json(createErrorResponse('InvoiceEntry not found'))
            }

            res.status(200).json(createSuccessResponse(updatedInvoiceEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(err.message))
    }
}
