const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        const organizationMembers = await prisma.organizationMember.findMany({
            where: {
                organizationId: orgId,
            },
        })

        return res.status(200).json(createSuccessResponse(organizationMembers))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}