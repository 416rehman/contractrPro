const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const s3 = require('../../../utils/s3')

module.exports = async (req, res) => {
    try {
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        const deleted = await prisma.contract.delete({
            where: {
                id: contractId,
                organizationId: orgId,
            },
            // Includes so we can delete all attachments from S3
            include: {
                Comments: {
                    include: {
                        Attachments: true,
                    },
                },
            },
        })

        if (!deleted) {
            throw new Error('Contract not found.')
        }

        // Delete all contract and job attachments
        const attachments = deleted.Comments.map((comment) => {
            return comment.Attachments
        }).flat()

        await Promise.all(
            attachments.map(async (attachment) => {
                return s3.delete(attachment.id)
            })
        )

        res.status(200).json(createSuccessResponse(deleted))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}