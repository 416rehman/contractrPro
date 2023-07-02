const { sequelize, OrganizationMember } = require('../../../db')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        await sequelize.transaction(async (transaction) => {
            const organizationMembers = await OrganizationMember.findAll({
                where: {
                    OrganizationId: orgId,
                },
                transaction,
            })

            return res
                .status(200)
                .json(createSuccessResponse(organizationMembers))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse(error.message))
    }
}
