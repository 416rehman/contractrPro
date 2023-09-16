const { sequelize, OrganizationMember } = require('../../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const memberId = req.params.member_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        if (!memberId || !isValidUUID(memberId)) {
            return res
                .status(400)
                .json(createErrorResponse('Member ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const organizationMember = await OrganizationMember.findOne({
                where: {
                    OrganizationId: orgId,
                    id: memberId,
                },
                transaction,
            })

            return res
                .status(200)
                .json(createSuccessResponse(organizationMember))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
