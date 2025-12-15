import { db, organizationMembers } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
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

        const organizationMember = await db.query.organizationMembers.findFirst({
            where: and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.id, memberId))
        })

        if (!organizationMember) {
            return res.status(400).json(createErrorResponse('Member not found')) // Or 404
        }

        return res
            .status(200)
            .json(createSuccessResponse(organizationMember))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
