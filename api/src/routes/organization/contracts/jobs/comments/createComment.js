const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../../utils/response')
const prisma = require('../../../../../prisma')
const { createId } = require('@paralleldrive/cuid2')
const s3 = require('../../../../../utils/s3')
const { zComment } = require('../../../../../validators/comment.zod')

module.exports = async (req, res) => {
    try {
        const jobId = req.params.job_id
        const orgId = req.params.org_id

        const data = zComment.partial().parse(req.body)
        const include = {}
        data.jobId = jobId
        data.authorId = req.auth.id
        data.updatedByUserId = req.auth.id
        data.organizationId = orgId

        if (
            (!req.files || req.files.length <= 0) &&
            (!data.content || data.content.length === 0)
        ) {
            return res
                .status(400)
                .json(
                    createErrorResponse(
                        'Either content or attachments are required.'
                    )
                )
        }

        let metadatas = []
        // Check if there are any attachments
        if (req.files && req.files.length > 0) {
            // Process attachments
            metadatas = req.files.map((file) => {
                file.key = createId()

                // https://[bucket-name].s3.[region-code].amazonaws.com/[key-name]
                const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`

                return {
                    id: file.key,
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    accessUrl,
                }
            })
        }

        if (metadatas.length > 0) {
            data.Attachments = {
                create: metadatas,
            }
            include.Attachments = true
        }

        // create the comment with attachments
        const comment = await prisma.comment.create({
            data,
            include,
        })

        // upload the attachments to s3
        if (req.files && req.files.length > 0) {
            try {
                await Promise.all(
                    req.files.map((file) => s3.upload(file, file.key))
                )
            } catch (error) {
                // delete the comment
                await prisma.comment.delete({
                    where: {
                        id: comment.id,
                        organizationId: orgId,
                    },
                })

                // Delete any new attachments that were uploaded
                await Promise.all(req.files.map((file) => s3.delete(file.key)))

                throw error
            }
        }

        return res.json(createSuccessResponse(comment))
    } catch (error) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', error))
    }
}