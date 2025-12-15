import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users, tokens } from '../../db';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * @openapi
 * /auth/forgot:
 *   post:
 *     summary: Request password reset token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required: [email]
 *     responses:
 *       200:
 *         description: If email exists, reset token sent
 *       400:
 *         description: Missing email
 */
export default async (req, res) => {
    try {
        const { email } = req.body
        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_EMAIL_REQUIRED))
        }

        await db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: eq(users.email, email),
                columns: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                    createdAt: true,
                    updatedAt: true
                }
            })

            if (user) {
                // Invalidate any existing password reset tokens for this user to prevent race conditions
                await tx.delete(tokens).where(and(
                    eq(tokens.userId, user.id),
                    eq(tokens.flags, tokenFlags.USER_PASSWORD_RESET_TOKEN)
                ));

                const tokenBody = {
                    userId: user.id,
                    type: 'password_reset',
                    value: randomUUID(),
                    flags: tokenFlags.USER_PASSWORD_RESET_TOKEN
                }
                // TODO: send email
                console.log(tokenBody)

                await tx.insert(tokens).values(tokenBody);
            }

            // ambiguous response to prevent email enumeration
            return res.json(createSuccessResponse(null))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

