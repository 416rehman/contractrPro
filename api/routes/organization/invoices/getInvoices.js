const { sequelize, Invoice, InvoiceEntry } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')

// get all org invoices
// supports filtering via the query params: contract_id, job_id, client_id
// supports pagination via the query params: page, limit
// supports expansion via the query params: expand
module.exports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const { contract_id, job_id, client_id } = req.query
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
        }
        if (contract_id && !isValidUUID(contract_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }
        if (job_id && !isValidUUID(job_id)) {
            return res.status(400).json(createErrorResponse('Invalid job_id'))
        }
        if (client_id && !isValidUUID(client_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid client_id'))
        }

        await sequelize.transaction(async (transaction) => {
            const options = {
                where: {
                    OrganizationId: orgId,
                    ...(contract_id && { ContractId: contract_id }),
                    ...(job_id && { JobId: job_id }),
                    ...(client_id && { BillToClientId: client_id }),
                },
                limit,
                offset: (page - 1) * limit,
                transaction,
            }

            if (req.query.expand) {
                options.include = {
                    model: InvoiceEntry,
                }
            }

            const invoices = await Invoice.findAll(options)

            res.status(200).json(createSuccessResponse(invoices))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
