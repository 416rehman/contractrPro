import { db, users } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
export default async (req, res) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, req.auth.id),
            columns: {
                id: true,
                username: true,
                email: true,
                name: true,
                flags: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return res.status(404).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
        }

        return res.status(200).json(createSuccessResponse(user))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

