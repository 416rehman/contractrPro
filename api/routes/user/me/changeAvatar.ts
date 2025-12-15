import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, users } from '../../../db';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /users/me/avatar:
 *   patch:
 *     summary: Update current user's avatar
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Avatar updated
 */
export default async (req, res) => {
    try {
        const avatarUrl = req.body?.avatarUrl?.trim()
        const UserId = req.auth.id

        if (!avatarUrl || avatarUrl.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        if (avatarUrl.startsWith('data:')) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const [updatedUser] = await db.update(users)
            .set({ avatarUrl })
            .where(eq(users.id, UserId))
            .returning();

        return res.json(createSuccessResponse(updatedUser))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

