import { db, invites } from '../../../db';

import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';

import { isValidUUID } from '../../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

// Gets the organization's invite
export default async (req, res) => {
    try {
        const orgID = req.params.org_id

        if (!orgID || !isValidUUID(orgID)) {
            return res
                .status(400)
                .json(createErrorResponse('Organization ID required'))
        }

        const inviteList = await db.query.invites.findMany({
            where: eq(invites.organizationId, orgID)
        })

        if (!inviteList || inviteList.length === 0) {
            return res
                .status(400)
                .json(createErrorResponse('Organization not found'))
        }

        return res.status(200).json(createSuccessResponse(inviteList))
    } catch (err) {
        return res
            .status(500)
            .json(
                createErrorResponse(
                    'Error getting organization invites',
                    err.message
                )
            )
    }
}
