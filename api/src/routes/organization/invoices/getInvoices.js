const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')

// get all org invoices
// supports filtering via the query params: contract_id, job_id, client_id
// supports pagination via the query params: page, limit
// supports expansion via the query params: expand
module.exports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const { contract_id, job_id, client_id } = req.query
        const orgId = req.params.org_id

        const invoices = await prisma.invoice.findMany({
            where: {
                organizationId: orgId,
                contractId: contract_id,
                jobId: job_id,
                clientId: client_id,
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                InvoiceEntries: !!req.query.expand,
            },
        })

        res.status(200).json(createSuccessResponse(invoices))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}