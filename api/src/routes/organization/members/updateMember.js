const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { isValidUUID } = require('../../../utils/isValidUUID')
const { pick } = require('../../../utils')
const { sequelize, OrganizationMember } = require('../../../../db')
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
        const body = {
            ...pick(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            OrganizationId: orgId,
            UpdatedByUserId: req.auth.id,
        }
        await sequelize.transaction(async (transaction) => {
            const queryResult = await OrganizationMember.update(body, {
                where: {
                    OrganizationId: orgId,
                    id: memberId,
                },
                transaction,
                returning: true,
            })
            if (!queryResult[0]) {
                throw new Error('Member not found')
            }
            const updatedMember = queryResult[1][0]
            return res.status(200).json(createSuccessResponse(updatedMember))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
