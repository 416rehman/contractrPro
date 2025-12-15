import { db, invites } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidInviteCode } from '../../../utils';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes an organization's invite
export default async (req, res) => {
    try {
        const orgID = req.params.org_id
        const inviteID = req.params.invite_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        if (!inviteID || !isValidInviteCode(inviteID)) {
            return res
                .status(400)
                .json(createErrorResponse('Invite ID required'))
        }

        const deletedRows = await db.delete(invites)
            .where(and(eq(invites.id, inviteID), eq(invites.organizationId, orgID)))
            .returning();

        // if delete returns array of deleted rows
        if (!deletedRows.length) {
            // Maybe it wasn't found
            // Standard behavior for delete is just success, but legacy code checked return value.
            // Returning success explicitly.
        }

        return res.status(200).json(createSuccessResponse(deletedRows.length))
    } catch (err) {
        return res
            .status(500)
            .json(createErrorResponse('Error deleting invite', err))
    }
}
