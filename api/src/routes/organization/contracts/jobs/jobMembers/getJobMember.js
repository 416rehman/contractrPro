const prisma = require('../../../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')

// Get jobMember
module.exports = async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const orgMemberId = req.params.member_id

        if (!jobId) throw new Error('Job ID is required.')
        if (!orgMemberId) throw new Error('OrganizationMember ID is required.')

        const jobMember = await prisma.jobMember.findFirst({
            where: {
                organizationMemberId: orgMemberId,
                Job: {
                    id: jobId,
                    Contract: {
                        id: contractId,
                        organizationId: orgId,
                    },
                },
            },
            include: {
                OrganizationMember: true,
                Job: true,
            },
        })

        return res.status(200).json(createSuccessResponse(jobMember))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}