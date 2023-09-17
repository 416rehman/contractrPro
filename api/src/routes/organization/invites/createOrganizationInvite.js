const prisma = require('../../../prisma')
const {
    createSuccessResponse,
    createErrorResponse,
} = require('../../../utils/response')
const { z } = require('zod')
const { generateRandomCode } = require('../../../utils')

// Creates an organization's invite
module.exports = async (req, res) => {
    try {
        const orgID = req.params.org_id
        const forOrganizationMemberID = req.body.forOrganizationMemberId

        if (!orgID) throw new Error('Organization ID is required.')

        const invite = await prisma.invite.create({
            data: {
                maxUses: z.number().parse(req.body.maxUses),
                forOrganizationMemberId: forOrganizationMemberID || undefined,
                organizationId: orgID,
                updatedByUserId: req.auth.id,
                id: generateRandomCode(8),
            },
        })

        return res.status(201).json(createSuccessResponse(invite))
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Error creating invite', err))
    }
}