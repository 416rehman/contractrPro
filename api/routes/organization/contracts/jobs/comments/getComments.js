const {
    Job,
    Comment,
    Attachment,
    Contract,
    sequelize,
} = require('../../../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../../../utils/response')

module.exports = async (req, res) => {
    try {
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!jobId || !isValidUUID(jobId)) {
            return res.status(400).json(createErrorResponse('Invalid job id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        const { page = 1, limit = 10 } = req.query

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        }

        await sequelize.transaction(async (transaction) => {
            const job = await Job.findOne({
                where: { id: jobId, ContractId: contractId },
                include: [
                    {
                        model: Contract,
                        where: { OrganizationId: orgId },
                    },
                ],
                transaction,
            })
            if (!job) {
                return res
                    .status(400)
                    .json(createErrorResponse('Job not found.'))
            }
            if (!job) {
                return res
                    .status(400)
                    .json(createErrorResponse('Job not found.'))
            }

            // Get the comments
            const comments = await Comment.findAndCountAll({
                where: {
                    JobId: jobId,
                },
                include: [
                    {
                        model: Attachment,
                    },
                ],
                transaction,
                ...options,
            })
            const totalPages = Math.ceil(comments.count / parseInt(limit))
            const response = {
                comments: comments.rows,
                currentPage: parseInt(page),
                totalPages,
            }

            return res.status(200).json(createSuccessResponse(response))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
