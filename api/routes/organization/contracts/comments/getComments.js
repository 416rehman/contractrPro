const {
    Organization,
    Contract,
    Comment,
    Attachment,
    sequelize,
} = require('../../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../../utils/response')

module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        const { page = 1, limit = 10 } = req.query

        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
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

            // Get the comments
            const comments = await Comment.findAndCountAll({
                where: {
                    ContractId: contractId,
                },
                include: [
                    {
                        model: Attachment,
                    },
                ],
                transaction,
                ...options,
            })
            const totalPages = Math.ceil(comments.count / parseInt(limit))
            const response = {
                comments: comments.rows,
                currentPage: parseInt(page),
                totalPages,
            }

            return res.status(200).json(createSuccessResponse(response))
        })
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('An error occurred.', err))
    }
}
