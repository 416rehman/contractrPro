// Add member to organization
const { OrganizationMember, sequelize } = require('../../../db')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const { pick } = require('../../../utils')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        if (!orgId) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }

        const body = {
            ...pick(req.body, [
                'name',
                'email',
                'phone',
                'permissions',
                'UserId',
            ]),
            OrganizationId: orgId,
            updatedByUserId: req.auth.id,
        }

        await sequelize.transaction(async (transaction) => {
            const member = OrganizationMember.build(body)
            await member.save({ transaction })

            res.status(200).json(createSuccessResponse(member))
        })
    } catch (error) {
        res.status(400).json(createErrorResponse(error.message))
    }
}
