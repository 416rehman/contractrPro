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

        const body = {
            ...pick(req.body, ['content']),
            JobId: jobId,
            AuthorId: req.auth.id,
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the job belongs to the org
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

            // Create the comment
            const comment = await Comment.create(body, { transaction })
            if (!comment) {
                return res
                    .status(400)
                    .json(createErrorResponse('Failed to create comment.'))
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
                        CommentId: comment.id,
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

            comment.dataValues.Attachments = attachments

            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', error))
    }
}
