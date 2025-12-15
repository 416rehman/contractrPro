import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users } from '../../db';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /auth/account:
 *   delete:
 *     summary: Delete current user's account
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Account deleted
 *       400:
 *         description: Error deleting account
 */
export default async (req, res) => {
    try {
        await db.transaction(async (tx) => {
            const deleted = await tx.delete(users)
                .where(eq(users.id, req.auth.id))
                .returning();

            if (deleted.length === 0) {
                return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
            }

            return res.json(createSuccessResponse({}))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

