const { OrganizationMember, sequelize } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
module.exports = async (req, res) => {
    try {
        if (!req.params.org_id) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!req.params.member_id) {
            return res
                .status(400)
                .json(createErrorResponse('Member ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const member = await OrganizationMember.findOne({
                where: {
                    OrganizationId: req.params.org_id,
                    id: req.params.member_id,
                },
                transaction,
            })

            if (!member) {
                throw new Error('Member not found')
            }

            await member.destroy({
                transaction,
            })

            res.status(200).json(createSuccessResponse(member))
        })
    } catch (error) {
        res.status(500).json(createErrorResponse(error.message, error))
    }
}
