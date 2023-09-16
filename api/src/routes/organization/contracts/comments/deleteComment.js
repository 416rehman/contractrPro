const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../../utils/response')
const { Contract, Comment, sequelize } = require('../../../../../db')
const { isValidUUID } = require('../../../../utils/isValidUUID')

// Deletes a comment
module.exports = async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid comment id.'))
        }

        if (!contractId || !isValidUUID(contractId)) {
            return res
                .status(400)
                .json(createErrorResponse('Invalid contract id.'))
        }

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse('Invalid org id.'))
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

            // Delete the comment
            const comment = await Comment.destroy({
                where: {
                    id: commentId,
                    ContractId: contractId,
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
