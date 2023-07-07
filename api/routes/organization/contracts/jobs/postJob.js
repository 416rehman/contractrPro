const { sequelize, Contract, Job } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')
// Post job
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        if (!contractID || !isValidUUID(contractID)) {
            return res
                .status(400)
                .json(createErrorResponse('Contract ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            // Find contract where contractID and orgID are the same as the params
            const contract = await Contract.findOne({
                where: {
                    id: contractID,
                    OrganizationId: orgID,
                },
                transaction,
            })

            if (!contract) {
                return res
                    .status(400)
                    .json(createErrorResponse('Contract not found'))
            }

            const body = {
                ...pick(req.body, [
                    'identifier',
                    'name',
                    'description',
                    'status',
                ]),
                ContractId: contractID,
                UpdatedByUserId: req.auth.id,
            }

            const createJob = await Job.create(body, {
                returning: true,
                transaction,
            })

            return res.status(200).json(createSuccessResponse(createJob))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to create job.'))
    }
}
