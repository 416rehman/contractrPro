const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const { Job, Comment, Contract, sequelize } = require('../../../../../../db')
const { isValidUUID } = require('../../../../../utils/isValidUUID')

// Deletes a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

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

        await sequelize.transaction(async (transaction) => {
            // make sure the contract belongs to the organization
            const contract = await Contract.findOne({
                where: {
                    id: contractId,
                    OrganizationId: orgId,
                },
                transaction,
            })
            if (!contract) {
                return res
                    .status(400)
                    .json(createErrorResponse('Contract not found.'))
            }
            const job = await Job.findOne({
                where: {
                    id: jobId,
                    ContractId: contractId,
                },
                transaction,
            })
            if (!job) {
                return res
                    .status(400)
                    .json(createErrorResponse('Job not found.'))
            }

            // Delete the comment
            const comment = await Comment.destroy({
                where: {
                    id: commentId,
                    JobId: jobId,
                    OrganizationId: orgId,
                },
                transaction,
            })

            return res.status(200).json(createSuccessResponse(comment))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete comment.'))
    }
}
