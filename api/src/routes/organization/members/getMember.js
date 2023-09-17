const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id
        const memberId = req.params.member_id

        if (!memberId) throw new Error('Member ID is required')

        const organizationMember = await prisma.organizationMember.findUnique({
            where: {
                id: memberId,
                organizationId: orgId,
            },
        })
        return res.status(200).json(createSuccessResponse(organizationMember))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}