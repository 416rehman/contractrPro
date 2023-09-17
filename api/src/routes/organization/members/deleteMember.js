const prisma = require('../../../prisma')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
module.exports = async (req, res) => {
    try {
        if (!req.params.member_id) throw new Error('Member ID is required')

        const deleted = await prisma.organizationMember.delete({
            where: {
                id: req.params.member_id,
                organizationId: req.params.org_id,
            },
        })

        if (!deleted) throw new Error('Member not found')

        return res.status(200).json(createSuccessResponse(deleted))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}