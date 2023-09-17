const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const prisma = require('../../../prisma')
const {
    zOrganizationMember,
} = require('../../../validators/organizationMember.zod')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const memberId = req.params.member_id

        if (!memberId) throw new Error('Member ID is required')

        const data = zOrganizationMember
            .pick({
                name: true,
                email: true,
                phone: true,
            })
            .parse(req.body)
        data.organizationId = orgId
        data.updatedByUserId = req.auth.id

        const member = await prisma.organizationMember.update({
            where: {
                id: memberId,
                organizationId: orgId,
            },
            data,
        })
        if (!member) throw new Error('Member not found')

        return res.status(200).json(createSuccessResponse(member))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}