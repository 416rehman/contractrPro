import { db, users } from '../../db';

import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';

import { isValidUUID } from '../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

// Gets a user's organization
export default async (req, res) => {
    try {
        const userID = req.params.user_id

        if (!userID || !isValidUUID(userID)) {
            return res.status(400).json(createErrorResponse('User ID required'))
        }

        // Transaction is not necessary for a single read query
        const userOrganizations = await db.query.users.findFirst({
            where: eq(users.id, userID),
            columns: {
                password: false,
                refreshToken: false,
                // deletedAt: false,
                // UpdatedByUserId: false,
            },
            with: {
                organizationMemberships: {
                    with: {
                        organization: true,
                    }
                }
            }
        });

        if (!userOrganizations) {
            return res
                .status(400)
                .json(createErrorResponse('User not found'))
        }

        return res
            .status(200)
            .json(createSuccessResponse(userOrganizations))
    } catch (error) {
        res.status(400).json(createErrorResponse('', error))
    }
}
