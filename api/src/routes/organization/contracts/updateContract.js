const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { zContract } = require('../../../validators/contract.zod')
const { zJob } = require('../../../validators/job.zod')
const prisma = require('../../../prisma')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!contractId) throw new Error('Contract ID is required')

        const data = zContract
            .pick({
                name: true,
                description: true,
                startDate: true,
                dueDate: true,
                completionDate: true,
                status: true,
                clientId: true,
            })
            .partial()
            .parse(req.body)
        data.updatedByUserId = req.auth.id
        data.organizationId = orgId

        const include = {}

        if (req.body?.Jobs) {
            const Jobs =
                req.body?.Jobs?.map((entry) =>
                    zJob
                        .pick({
                            reference: true,
                            name: true,
                            description: true,
                            status: true,
                            dueDate: true,
                            startDate: true,
                            assignedTo: true,
                            completionDate: true,
                        })
                        .partial()
                        .parse(entry)
                ) || []

            data.Jobs = {
                set: Jobs,
            }
            include.Jobs = true
        }

        const updatedContract = await prisma.contract.update({
            where: {
                id: contractId,
                organizationId: orgId,
            },
            data,
            include,
        })

        res.status(200).json(createSuccessResponse(updatedContract))
    } catch (err) {
        return res.status(400).json(createErrorResponse(err))
    }
}