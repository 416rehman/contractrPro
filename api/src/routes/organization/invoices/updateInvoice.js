const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { zInvoiceEntry, zInvoice } = require('../../../validators/invoice.zod')

module.exports = async (req, res) => {
    try {
        const { org_id, invoice_id } = req.params

        if (!invoice_id) throw new Error('Invoice ID is required')

        const InvoiceEntries =
            req.body?.InvoiceEntries?.map((entry) =>
                zInvoiceEntry
                    .pick({
                        description: true,
                        quantity: true,
                        unitPrice: true,
                        unit: true,
                        name: true,
                    })
                    .parse(entry)
            ) || []

        if (InvoiceEntries.length === 0)
            throw new Error(
                'InvoiceEntries is required. Provide at least one entry, like this: { "InvoiceEntries": [{ "description": "some description", "quantity": 1, "unitPrice": 100, "name": "some name" }] }'
            )

        const data = zInvoice.parse(req.body)
        data.InvoiceEntries = {
            set: InvoiceEntries,
        }
        data.organizationId = org_id
        data.updatedByUserId = req.auth.id

        const updatedInvoice = await prisma.invoice.update({
            where: {
                id: invoice_id,
                organizationId: org_id,
            },
            data,
            include: {
                InvoiceEntries: true,
            },
        })

        res.status(200).json(createSuccessResponse(updatedInvoice))
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}