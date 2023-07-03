const {
    sequelize,
    Invoice,
    Contract,
    Job,
    InvoiceEntry,
} = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils/index')

// create invoice
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid organization_id'))
        }

        const body = {
            ...pick(req.body, [
                'invoiceNumber',
                'invoiceDate',
                'dueDate',
                'poNumber',
                'note',
                'taxRate',
                'BillToClientId',
                'ContractId',
                'JobId',
                'InvoiceEntries',
            ]),
            OrganizationId: orgId,
            UpdatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the contract belongs to the org
            if (body.ContractId) {
                await Contract.findOne({
                    where: {
                        id: body.ContractId,
                        OrganizationId: orgId,
                    },
                    transaction,
                })
                throw new Error('Contract not found')
            }

            // make sure the job belongs to the org
            if (body.JobId) {
                await Job.findOne({
                    where: {
                        id: body.JobId,
                        OrganizationId: orgId,
                    },
                    transaction,
                })
                throw new Error('Job not found')
            }

            const invoice = await Invoice.create(body, {
                transaction,
                include: req.body.InvoiceEntries && [InvoiceEntry],
            })
            return res.status(201).json(createSuccessResponse(invoice))
        })
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}
