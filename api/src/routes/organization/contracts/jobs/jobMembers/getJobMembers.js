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

        if (!jobId) throw new Error('Job ID is required.')

        const jobMembers = await prisma.jobMember.findMany({
            where: {
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

        return res.status(200).json(createSuccessResponse(jobMembers))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}