const { Invoice, Comment, Attachment, sequelize } = require('../../../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../../utils/response')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const invoiceId = req.params.invoice_id

        const { page = 1, limit = 10 } = req.query

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the invoice belongs to the org
            const invoice = await Invoice.findOne({
                where: { id: invoiceId, OrganizationId: orgId },
                transaction,
            })
            if (!invoice) {
                return res
                    .status(400)
                    .json(createErrorResponse('Invoice not found.'))
            }

            // Get the comments
            const comments = await Comment.findAndCountAll({
                where: {
                    InvoiceId: invoiceId,
                },
                include: [
                    {
                        model: Attachment,
                    },
                ],
                transaction,
                ...options,
            })
            const totalPages = Math.ceil(comments.count / parseInt(limit))
            const response = {
                comments: comments.rows,
                currentPage: parseInt(page),
                totalPages,
            }

            return res.status(200).json(createSuccessResponse(response))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
