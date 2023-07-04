const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const { pick } = require('../../../../../utils')
const {
    Job,
    Comment,
    Attachment,
    Contract,
    sequelize,
} = require('../../../../../db')
const { isValidUUID } = require('../../../../../utils/isValidUUID')

// Updates a comment
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

        const body = {
            ...pick(req.body, ['content']),
            JobId: jobId,
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
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

            let attachments = null
            // Check if there are any attachments
            if (req.files && req.files.length > 0) {
                // Process attachments
                const attachmentsData = req.files.map((file) => {
                    return {
                        id: file.key,
                        filename: file.originalname,
                        mimetype: file.mimetype,
                        fileSizeBytes: file.size,
                        accessUrl: file.location,
                        CommentId: commentId,
                    }
                })

                // Create the attachments
                attachments = await Attachment.bulkCreate(attachmentsData, {
                    transaction,
                })
                if (!attachments) {
                    return res
                        .status(400)
                        .json(
                            createErrorResponse('Failed to create attachments.')
                        )
                }
            }

            // Update the comment
            const comment = await Comment.update(body, {
                where: {
                    id: commentId,
                    JobId: jobId,
                    OrganizationId: orgId,
                },
                transaction,
            })
            if (!comment || comment[0] === 0) {
                console.log(orgId, jobId, commentId)
                return res
                    .status(400)
                    .json(createErrorResponse('Failed to update comment.'))
            }

            return res.status(200).json(createSuccessResponse(comment))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
