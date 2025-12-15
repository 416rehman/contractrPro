import {
    createSuccessResponse,
    createErrorResponse,
} from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, users, tokens } from '../../db';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const schema = z.object({
    body: z.object({
        email: z.string().email(),
    }),
});

/**
 * @openapi
 * /auth/forgot:
 *   post:
 *     summary: Request password reset
 *     description: |
 *       Initiates the password reset process. If the email is associated with an account, a reset link will be sent.
 *       The response is always successful to prevent email enumeration.
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
 *               email:
 *                 type: string
 *                 format: email
 *             required: [email]
 *     responses:
 *       200:
 *         description: Request processed (Always returns 200)
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many attempts
 */
const handler = async (req, res) => {
    try {
        const { email } = req.body

        await db.transaction(async (tx) => {
            const user = await tx.query.users.findFirst({
                where: eq(users.email, email),
                columns: {
                    id: true,
                }
            })

            if (user) {
                // Invalidate any existing password reset tokens for this user
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
                // Mock email sending
                console.log(`[Mock Email] Password reset token for ${email}: ${tokenBody.value}`)

                await tx.insert(tokens).values(tokenBody);
            }

            // Ambiguous response to prevent email enumeration
            return res.json(createSuccessResponse(null))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

export default { schema, handler };

