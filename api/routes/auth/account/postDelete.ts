import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, users, tokens } from '../../../db';
import { eq, and } from 'drizzle-orm';
import { tokenFlags } from '../../../db/flags';
import { z } from 'zod';

const schema = z.object({
    body: z.object({
        token: z.string().uuid("Invalid token format"),
    }),
});

/**
 * @openapi
 * /auth/account/delete:
 *   post:
 *     summary: Confirm account deletion
 *     description: |
 *       Permanently deletes the current user's account and all associated data.
 *       **Requires a valid confirmation token obtained via `/auth/account/token`.**
 *       **Warning: This action is irreversible.**
 *       
 *       **Security**:
 *       - Requires a valid Access Token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The confirmation token received via email.
 *             required: [token]
 *     responses:
 *       200:
 *         description: Account successfully deleted
 *       400:
 *         description: Invalid token or User not found
 *       401:
 *         description: Unauthorized
 */
const handler = async (req, res) => {
    try {
        const { token } = req.body;

        await db.transaction(async (tx) => {
            // Verify Token
            const validToken = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.value, token),
                    eq(tokens.userId, req.auth.id),
                    eq(tokens.flags, tokenFlags.USER_ACCOUNT_DELETE_TOKEN)
                )
            });

            if (!validToken) {
                return res.status(400).json(createErrorResponse(ErrorCode.AUTH_INVALID_TOKEN, "Invalid or expired confirmation token"))
            }

            // Delete User
            const deleted = await tx.delete(users)
                .where(eq(users.id, req.auth.id))
                .returning();

            if (deleted.length === 0) {
                return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
            }

            return res.json(createSuccessResponse({}))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

export default { schema, handler };

