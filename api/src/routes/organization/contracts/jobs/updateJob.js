const prisma = require('../../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { zJob } = require('../../../../validators/job.zod')

// Post job
module.exports = async (req, res) => {
    try {
        const contractID = req.params.contract_id
        const jobId = req.params.job_id

        if (!jobId) throw new Error('Job ID is required.')

        const data = zJob.partial().parse(req.body)
        data.contractId = contractID

        const createdJob = await prisma.job.update({
            where: {
                id: jobId,
                contractId: contractID,
            },
            data,
        })

        return res.status(200).json(createSuccessResponse(createdJob))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to create job.'))
    }
}