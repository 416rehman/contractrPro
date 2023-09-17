const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { zContract } = require('../../../validators/contract.zod')
const { zJob } = require('../../../validators/job.zod')

// Creates an organization's contract
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const data = zContract.parse(req.body)
        const include = {}

        data.organizationId = orgID
        data.updatedByUserId = req.auth.id

        if (req.body?.Jobs?.length) {
            data.Jobs = req.body.Jobs.map((job) => zJob.parse(job))
            include.Jobs = true
        }

        const createdContract = await prisma.contract.create({
            data,
            include,
        })

        for (let i = 0; i < createdContract?.Jobs?.length; i++) {
            const job = createdContract.Jobs[i]
            const memberIds = job.assignedTo
            if (!memberIds?.length) {
                continue
            }

            // remove any job members that are not defined in the request
            await prisma.jobMember.deleteMany({
                where: {
                    jobId: job.id,
                    organizationMemberId: {
                        notIn: memberIds,
                    },
                },
            })

            // add any job members that are not already assigned to the job
            await prisma.jobMember.createMany({
                data: memberIds.map((memberId) => ({
                    jobId: job.id,
                    organizationMemberId: memberId,
                })),
                skipDuplicates: true,
            })
        }

        return res.status(201).json(createSuccessResponse(createdContract))
    } catch (err) {
        return res.status(400).json(createErrorResponse(err))
    }
}