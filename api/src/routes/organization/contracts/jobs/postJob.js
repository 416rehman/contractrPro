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

        const data = zJob.parse(req.body)
        data.contractId = contractID
        data.updatedByUserId = req.auth.id

        const createdJob = await prisma.job.create({
            data,
        })

        return res.status(200).json(createSuccessResponse(createdJob))
    } catch (error) {
        res.status(500).json(createErrorResponse('Failed to create job.'))
    }
}