const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { Client, Comment, sequelize } = require('../../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Deletes a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const clientId = req.params.client_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!clientId || !isValidUUID(clientId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid client id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
        }

        await sequelize.transaction(async (transaction) => {
            // make sure the client belongs to the org
            const client = await Client.findOne({
                where: { id: clientId, OrganizationId: orgId },
                transaction,
            })
            if (!client) {
                return res
                    .status(400)
                    .json(createErrorResponse('Client not found.'))
            }

            // Delete the comment
            const comment = await Comment.destroy({
                where: {
                    id: commentId,
                    ClientId: clientId,
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
