import { db, organizationMembers } from '../../../db';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        if (!req.params.org_id || !isValidUUID(req.params.org_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID is required'))
        }
        if (!req.params.member_id || !isValidUUID(req.params.member_id)) {
            return res
                .status(400)
                .json(createErrorResponse('Member ID is required'))
        }

        const deletedRows = await db.delete(organizationMembers)
            .where(and(eq(organizationMembers.id, req.params.member_id), eq(organizationMembers.organizationId, req.params.org_id)))
            .returning();

        if (!deletedRows.length) {
            return res
                .status(400)
                .json(createErrorResponse('Member not found'))
        }

        return res.status(200).json(createSuccessResponse(deletedRows.length))
    } catch (error) {
        return res.status(400).json(createErrorResponse('', error))
    }
}
