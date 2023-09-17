const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const prisma = require('../../../../prisma')
const s3 = require('../../../../utils/s3')
const { zComment } = require('../../../../validators/comment.zod')
const cuid2 = require('@paralleldrive/cuid2')

module.exports = async (req, res) => {
    try {
        const clientId = req.params.client_id
        const orgId = req.params.org_id
        const commentId = req.params.comment_id

        if (!clientId) throw new Error('Client id is required.')
        if (!orgId) throw new Error('Org id is required.')
        if (!commentId) throw new Error('Comment id is required.')

        const data = zComment.partial().parse(req.body)
        const include = {}
        data.updatedByUserId = req.auth.id

        // check if the comment currently has attachments
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { Attachments: true },
        })

        // if new content is empty and there are no attachments, delete the comment
        if (
            !data.content &&
            (!comment.Attachments || comment.Attachments.length === 0)
        ) {
            await prisma.comment.delete({
                where: { id: commentId },
            })

            await Promise.all(
                comment.Attachments.map(async (attachment) => {
                    await s3.delete(attachment.id)
                })
            )

            return res.json(createSuccessResponse('Comment deleted.'))
        }

        let metadatas = null
        // Check if there are any new attachments
        if (req.files && req.files.length > 0) {
            // Process attachments
            metadatas = req.files.map((file) => {
                file.key = cuid2.createId()

                // https://[bucket-name].s3.[region-code].amazonaws.com/[key-name]
                const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`

                return {
                    id: file.key,
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    accessUrl,
                    CommentId: commentId,
                }
            })
        }

        // if there are new attachments, add them
        if (metadatas && metadatas.length > 0) {
            data.Attachments = {
                create: metadatas,
            }
            include.Attachments = true
        }

        // Update the comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId, clientId, organizationId: orgId },
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

                await Promise.all(req.files.map((file) => s3.delete(file.key)))

                throw error
            }
        }

        return res.json(createSuccessResponse(updatedComment))
    } catch (error) {
        return res.json(createErrorResponse(error))
    }
}