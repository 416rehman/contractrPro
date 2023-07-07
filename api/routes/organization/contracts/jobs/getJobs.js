const { sequelize, Contract, Job } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')
// Get jobs
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
            const jobs = await Job.findAll({
                where: {
                    ContractId: contractID,
                },
                include: [
                    {
                        model: Contract,
                        where: {
                            id: contractID,
                            OrganizationId: orgID,
                        },
                        required: true,
                    },
                ],
                transaction,
            })

            if (!jobs) {
                return res
                    .status(400)
                    .json(createErrorResponse('Contract not found'))
            }

            return res.status(200).json(createSuccessResponse(jobs))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get jobs.'))
    }
}
