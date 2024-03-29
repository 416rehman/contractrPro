const { Contract, Job, OrganizationMember } = require('../../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const { isValidUUID } = require('../../../../../utils/isValidUUID')

// Delete jobMember
module.exports = async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const orgMemberId = req.params.member_id

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Invalid job id.'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        if (!orgMemberId || !isValidUUID(orgMemberId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid orgMember id.'))
        }

        // Get the orgMember
        const orgMember = await OrganizationMember.findOne({
            where: {
                id: orgMemberId,
                OrganizationId: orgId,
            },
        })

        if (!orgMember) {
            return res
                .status(400)
                .json(createErrorResponse('Failed to find orgMember.'))
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
                .status(400)
                .json(createErrorResponse('Failed to find job.'))
        }

        // Check if the orgMember is already a member of the job
        const result = job.removeOrganizationMember(orgMember)

        // // Add the orgMember to the job
        // const jobMember = await JobMember.create({
        //     JobId: jobId,
        //     OrganizationMemberId: orgMemberId,
        // })

        return res.status(200).json(createSuccessResponse(result))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}
