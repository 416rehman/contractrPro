const prisma = require('../../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')

// Get job
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id
        const jobId = req.params.job_id

        if (!jobId) throw new Error('Job ID is required')

        // Find contract where contractID and orgID are the same as the params
        const job = await prisma.job.findUnique({
            where: {
                id: jobId,
                Contract: {
                    id: contractID,
                    organizationId: orgID,
                },
            },
            include: {
                JobEntries: true,
            },
        })

        if (!job) throw new Error('Job not found')

        return res.status(200).json(createSuccessResponse(job))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get jobs.'))
    }
}