import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, users, tokens } from '../../../db';
import { tokenFlags } from '../../../db/flags';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /users/me/email:
 *   patch:
 *     summary: Request email change
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Verification email sent
 */
export default async (req, res) => {
    try {
        const email = req.body?.email?.trim()
        const UserId = req.auth.id

        if (!email || email.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_EMAIL_REQUIRED))
        }

        const user = await db.query.users.findFirst({ where: eq(users.id, UserId) });
        if (!user) {
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
        }

        if (user.email === email) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        await db.transaction(async (tx) => {
            const preExistingToken = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.userId, user.id),
                    eq(tokens.flags, tokenFlags.USER_EMAIL_VERIFY_TOKEN)
                )
            });

            const tokenValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const tokenBody = {
                type: 'email_verify',
                value: tokenValue,
                userId: UserId,
                flags: tokenFlags.USER_EMAIL_VERIFY_TOKEN,
                meta: { email }
            };

            if (preExistingToken) {
                await tx.update(tokens).set(tokenBody).where(eq(tokens.id, preExistingToken.id));
            } else {
                await tx.insert(tokens).values(tokenBody);
            }

            return res.json(createSuccessResponse(null))
        })
    } catch (err) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err));
    }
}

