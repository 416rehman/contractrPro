const { sequelize, Contract, Job } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const { pick } = require('../../../../utils')
// Put job
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

            const updateJob = await Job.update(body, {
                where: {
                    id: jobId,
                },
                returning: true,
                transaction,
            })

            if (!updateJob) {
                return res
                    .status(400)
                    .json(createErrorResponse('Failed to update job.'))
            }

            return res.status(200).json(createSuccessResponse(updateJob))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to update job.'))
    }
}
