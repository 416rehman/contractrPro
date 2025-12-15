import { db, users } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { isValidUUID } from '../../utils/isValidUUID';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /users/{user_id}/organizations:
 *   get:
 *     summary: Get user with their organizations
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User with organizations
 */
export default async (req, res) => {
    try {
        const userID = req.params.user_id

        if (!userID || !isValidUUID(userID)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_USER_ID_REQUIRED))
        }

        const userOrganizations = await db.query.users.findFirst({
            where: eq(users.id, userID),
            columns: {
                password: false,
                refreshToken: false,
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
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(userOrganizations))
    } catch (error) {
        res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

