import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, users } from '../../../db';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /users/me/name:
 *   patch:
 *     summary: Update current user's name
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Name updated
 */
export default async (req, res) => {
    try {
        const name = req.body?.name?.trim()
        const UserId = req.auth.id

        if (!name || name.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const [updatedUser] = await db.update(users)
            .set({ name })
            .where(eq(users.id, UserId))
            .returning();

        return res.json(createSuccessResponse(updatedUser))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

