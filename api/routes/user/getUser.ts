import { db, users } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /users/{user_id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
export default async (req, res) => {
    try {
        const id = req.params.user_id

        if (!id) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_USER_ID_REQUIRED))
        }

        const resolvedId = id === 'me' || id === '@me' || id === '@' ? req.auth.id : id;

        const user = await db.query.users.findFirst({
            where: eq(users.id, resolvedId),
            columns: {
                id: true,
                username: true,
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

