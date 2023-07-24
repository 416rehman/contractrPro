const {
    sequelize,
    Expense,
    Contract,
    Job,
    ExpenseEntry,
} = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils/index')

// create expense
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
                'description',
                'date',
                'taxRate',
                'VendorId',
                'ContractId',
                'JobId',
                'ExpenseEntries',
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

            const expense = await Expense.create(body, {
                transaction,
                include: req.body.ExpenseEntries && [ExpenseEntry],
            })
            return res.status(201).json(createSuccessResponse(expense))
        })
    } catch (e) {
        return res.status(400).json(createErrorResponse(e.message))
    }
}
