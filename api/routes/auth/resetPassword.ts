import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, tokens, users } from '../../db';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const schema = z.object({
    body: z.object({
        token: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: |
 *       Resets the user's password using a valid reset token obtained via email.
 *       
 *       **Rate Limit**: 5 requests per 15 minutes.
 *       
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The password reset token received via email from the `/auth/forgot` endpoint
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: The new password for the user. Must be at least 8 characters.
 *             required: [token, password]
 *     responses:
 *       200:
 *         description: Password successfully updated. User can now login with the new password.
 *       400:
 *         description: Invalid token or weak password provided.
 */
const handler = async (req, res) => {
    try {
        const { token, password } = req.body;

        await db.transaction(async (tx) => {
            const tokenInstance = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.value, token),
                    eq(tokens.flags, tokenFlags.USER_PASSWORD_RESET_TOKEN)
                )
            });

            if (!tokenInstance) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_TOKEN));
            }

            const user = await tx.query.users.findFirst({
                where: eq(users.id, tokenInstance.userId!)
            });

            if (!user) {
                return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND));
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await tx.update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, user.id));

            // Consume the token
            await tx.delete(tokens).where(eq(tokens.id, tokenInstance.id));

            return res.json(createSuccessResponse(null));
        });
    } catch (error) {
        // If headers already sent (e.g. from inside transaction logic if it failed subtly?), avoid crashing.
        if (!res.headersSent) {
            return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
        }
    }
}

export default { schema, handler };
