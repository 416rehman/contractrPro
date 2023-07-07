const {
    sequelize,
    Contract,
    OrganizationMember,
    JobMember,
    Job,
} = require('../../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const { isValidUUID } = require('../../../../../utils/isValidUUID')
const { pick } = require('../../../../../utils')

// Update Job Member
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const jobId = req.params.job_id
        const memberId = req.params.member_id

        if (!isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract_id'))
        }

        if (!isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org_id'))
        }

        if (!isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Invalid job_id'))
        }

        if (!isValidUUID(memberId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid member_id'))
        }

        const body = {
            ...pick(req.body, ['permissionOverwrites']),
            UpdatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const organizationMember = await OrganizationMember.findOne({
                where: {
                    id: memberId,
                    OrganizationId: orgId,
                },
            })

            if (!organizationMember) {
                return res
                    .status(404)
                    .json(createErrorResponse('Organization member not found'))
            }

            const job = await Job.findOne({
                where: {
                    id: jobId,
                    ContractId: contractId,
                },
                include: [
                    {
                        model: Contract,
                        where: {
                            id: contractId,
                            OrganizationId: orgId,
                        },
                        required: true,
                    },
                ],
            })

            if (!job) {
                return res
                    .status(404)
                    .json(createErrorResponse('Job not found'))
            }

            const jobMember = await JobMember.findOne({
                where: {
                    OrganizationMemberId: memberId,
                    JobId: jobId,
                },
            })

            if (!jobMember) {
                return res
                    .status(404)
                    .json(createErrorResponse('Job member not found'))
            }

            await jobMember.update(body, { transaction })

            return res
                .status(200)
                .json(createSuccessResponse('Job member updated successfully'))
        })
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Internal server error'))
    }
}
