const prisma = require('../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../utils/response')
const s3 = require('../../utils/s3')

module.exports = async (req, res) => {
    try {
        const org_id = req.params.org_id
        if (!org_id) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const deletedOrg = await prisma.organization.delete({
            where: {
                id: org_id,
            },
            include: {
                Comments: {
                    include: {
                        Attachments: true,
                    },
                },
            },
        })
        if (!deletedOrg) {
            throw new Error('Organization not found')
        }

        const commentAttachments = deletedOrg.Comments.map((comment) => {
            return comment.Attachments
        }).flat()

        await Promise.all(
            commentAttachments.map(async (attachment) => {
                return s3.delete(attachment.id)
            })
        )

        res.status(200).json(createSuccessResponse(deletedOrg))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}