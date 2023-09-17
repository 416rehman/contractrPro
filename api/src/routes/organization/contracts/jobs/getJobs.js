const prisma = require('../../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')

// Get jobs
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const contractID = req.params.contract_id

        // Find contract where contractID and orgID are the same as the params
        const jobs = await prisma.job.findMany({
            where: {
                Contract: {
                    id: contractID,
                    organizationId: orgID,
                },
            },
        })

        if (!jobs) throw new Error('Jobs not found')

        return res.status(200).json(createSuccessResponse(jobs))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to get jobs.'))
    }
}