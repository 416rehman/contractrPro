// DELETE /organizations/:org_id/contracts/:contract_id/invoices/:invoice_id
const { sequelize, Invoice } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!invoiceId || !isValidUUID(invoiceId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invoice ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const rowsDeleted = await Invoice.destroy({
                where: {
                    OrganizationId: orgId,
                    id: invoiceId,
                },
                transaction,
            })
            if (!rowsDeleted) {
                return res
                    .status(400)
                    .json(createErrorResponse('Invoice not found'))
            }

            res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
