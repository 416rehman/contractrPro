import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, tokens, users } from '../../db';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a valid token
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
 *               password:
 *                 type: string
 *                 minLength: 8
 *             required: [token, password]
 *     responses:
 *       200:
 *         description: Password successfully updated
 *       400:
 *         description: Invalid token or weak password
 */
export default async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || typeof token !== 'string') {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_MISSING_TOKEN));
        }

        if (!password || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_PASSWORD_TOO_SHORT));
        }

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
        });

        // Outside transaction to ensure we don't leak logic if response fails, 
        // but if transaction fails validation errors will be caught.
        // Returning success here means password was changed.
        return res.json(createSuccessResponse(null));

    } catch (error) {
        // If the error was thrown from within the transaction callback (e.g. invalid token custom throw or db error), handle it.
        // Ideally we shouldn't throw 400s as errors but return them. 
        // The check `if (!tokenInstance)` above handles the logic flow correctly via return.
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
    }
}
