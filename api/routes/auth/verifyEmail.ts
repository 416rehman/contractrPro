import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, tokens, users } from '../../db';
import { tokenFlags, UserFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
    body: z.object({
        token: z.string().min(1, "Token is required"),
    }),
});

/**
 * @openapi
 * /auth/verify/email:
 *   post:
 *     summary: Verify email address
 *     description: |
 *       Verifies the user's email address using the token received via email.
 *       Updates the user's email to the verified address if applicable.
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
 *                 description: The email verification token received via email.
 *             required: [token]
 *     responses:
 *       200:
 *         description: Email verified successfully. User account flagged as verified.
 *       400:
 *         description: Invalid, expired, or malformed token.
 */
const handler = async (req, res) => {
    try {
        const { token } = req.body;

        await db.transaction(async (tx) => {
            const tokenInstance = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.value, token),
                    eq(tokens.flags, tokenFlags.USER_EMAIL_VERIFY_TOKEN)
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

            // Ensure we use the meta email which is the NEW email
            const newEmail = tokenInstance.meta ? (tokenInstance.meta as any).email : user.email;

            // If we require the meta email to exist (e.g. email change flow), check it. 
            // If just verification on signup, maybe meta is empty and we verify current email?
            // Existing code enforced `if (!newEmail) return ... INTERNAL_ERROR`. which implies meta email is expected.
            // But if it's null, we shouldn't crash. I'll fallback to current user email if meta absent, or error if strictly required.
            // User said "wire up". Existing code had `if (!newEmail)`. It implies meta MUST exist.
            // I'll keep previous strict check logic but fail gracefully if logic demands it.
            // Wait, if it's signup verification, `tokenInstance.meta` might be null?
            // I'll stick to original logic: `const newEmail = ...; if (!newEmail) return ... INTERNAL_ERROR`.
            const emailToVerify = (tokenInstance.meta as any)?.email;

            if (!emailToVerify) {
                // If it's a simple verification of existing email, we might not have meta.
                // But let's assume the previous dev knew. If it fails, I'll see it in tests. 
                // Actually, safeguard: If meta is missing, verify user.email?
                // I'll stick to 1:1 refactor of logic for now to avoid breaking flow I don't fully see.
                return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, "Token missing email metadata"));
            }

            await tx.update(users)
                .set({
                    email: emailToVerify,
                    flags: (user.flags || 0) | UserFlags.VERIFIED_EMAIL
                })
                .where(eq(users.id, user.id));

            await tx.delete(tokens).where(eq(tokens.id, tokenInstance.id));

            return res.json(createSuccessResponse(null));
        });

    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
        }
    }
}

export default { schema, handler };
