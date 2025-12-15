import { db, invites } from '../../../db';
import { isValidUUID } from '../../../utils/isValidUUID';

import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidInviteCode } from '../../../utils';
import { eq, and } from 'drizzle-orm';

// Gets the organization's invite by ID
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

        const invite = await db.query.invites.findFirst({
            where: and(eq(invites.id, inviteID), eq(invites.organizationId, orgID))
        })

        if (!invite) {
            return res
                .status(400)
                .json(createErrorResponse('Organization invite not found'))
        }

        return res.status(200).json(createSuccessResponse(invite))
    } catch (err) {
        return res
            .status(500)
            .json(
                createErrorResponse('Error getting organization invite by ID')
            )
    }
}
