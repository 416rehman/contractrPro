const prisma = require('../../../prisma')
const {
    createErrorResponse,
    createSuccessResponse,
} = require('../../../utils/response')
const {
    zOrganizationMember,
} = require('../../../validators/organizationMember.zod')
module.exports = async (req, res) => {
    try {
        const orgId = req.params.org_id

        const data = zOrganizationMember
            .pick({
                name: true,
                email: true,
                phone: true,
            })
            .parse(req.body)
        data.organizationId = orgId
        data.updatedByUserId = req.auth.id

        const member = await prisma.organizationMember.create({
            data,
        })
        res.status(201).json(createSuccessResponse(member))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}