const { sequelize, Contract, Job } = require('../../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// delete job
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id
        const jobId = req.params.job_id

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

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Job ID required'))
        }

        await sequelize.transaction(async (transaction) => {
            // Find contract where contractID and orgID are the same as the params
            const job = await Job.findOne({
                where: {
                    id: jobId,
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

            if (!job) {
                return res
                    .status(400)
                    .json(createErrorResponse('Job not found'))
            }

            await job.destroy({ transaction })

            return res.status(200).json(createSuccessResponse(1))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse('', error))
    }
}
