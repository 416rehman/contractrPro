import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils';
import { db, organizationMembers } from '../../../db';
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
        const body = {
            ...pick(req.body, [
                'name',
                'email',
                'phone',
                'website',
                'description',
            ]),
            updatedByUserId: req.auth.id,
        }

        const [updatedMember] = await db.update(organizationMembers)
            .set(body)
            .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.organizationId, orgId)))
            .returning();

        if (!updatedMember) {
            throw new Error('Member not found')
        }

        return res.status(200).json(createSuccessResponse(updatedMember))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
