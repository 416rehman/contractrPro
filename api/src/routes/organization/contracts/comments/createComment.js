const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const UUID = require('uuid')
const { pick } = require('../../../../utils')
const { Contract, Comment, Attachment, sequelize } = require('../../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')
const s3 = require('../../../../utils/s3')

module.exports = async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        const body = {
            ...pick(req.body, ['content']),
            ContractId: contractId,
            AuthorId: req.auth.id,
            UpdatedByUserId: req.auth.id,
            OrganizationId: orgId,
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the contract belongs to the org
            const contract = await Contract.findOne({
                where: { id: contractId, OrganizationId: orgId },
                transaction,
            })
            if (!contract) {
                return res
                    .status(400)
                    .json(createErrorResponse('Contract not found.'))
            }

            if (
                (!req.files || req.files.length <= 0) &&
                (!body.content || body.content.length === 0)
            ) {
                return res
                    .status(400)
                    .json(
                        createErrorResponse(
                            'Content cannot be empty if there are no attachments.'
                        )
                    )
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
                    file.key = UUID.v4(
                        Date.now().toString() + file.originalname
                    )

                    // https://[bucket-name].s3.[region-code].amazonaws.com/[key-name]
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`

                    return {
                        id: file.key,
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        CommentId: comment.id,
                    }
                })

                // Store the attachments metadata in the database
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

                // upload the attachments to s3Contract
                for (const file of req.files) {
                    await s3.upload(file, file.key)
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
