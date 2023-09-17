const prisma = require('../../../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')

// Post jobMember
module.exports = async (req, res) => {
    try {
        const jobId = req.params.job_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const memberId = req.body.organizationMemberId

        if (!jobId) throw new Error('Job ID is required.')
        if (!memberId) throw new Error('OrganizationMember ID is required.')

        // check that the job belongs to the contract
        const job = await prisma.job.findFirst({
            where: {
                id: jobId,
                Contract: {
                    id: contractId,
                    organizationId: orgId,
                },
            },
        })
        if (!job) throw new Error('Job does not exist.')

        const data = {}
        data.updatedByUserId = req.auth.id
        data.jobId = jobId
        data.organizationMemberId = memberId

        const result = await prisma.jobMember.create({
            data,
        })

        return res.status(200).json(createSuccessResponse(result))
    } catch (err) {
        return res.status(500).json(createErrorResponse('', err))
    }
}