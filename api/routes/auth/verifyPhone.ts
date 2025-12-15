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
 * /auth/verify/phone:
 *   post:
 *     summary: Verify phone number
 *     description: |
 *       Verifies the user's phone number using the token received via SMS.
 *       Updates the user's phone number and verification status.
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
 *                 description: The phone verification token received via SMS.
 *             required: [token]
 *     responses:
 *       200:
 *         description: Phone number verified successfully. User account flagged as verified.
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
                    eq(tokens.flags, tokenFlags.USER_PHONE_VERIFY_TOKEN)
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

            const phoneData = tokenInstance.meta as any;
            if (!phoneData || !phoneData.phoneCountry || !phoneData.phoneNumber) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED));
            }

            await tx.update(users)
                .set({
                    phoneCountry: phoneData.phoneCountry,
                    phoneNumber: phoneData.phoneNumber,
                    flags: (user.flags || 0) | UserFlags.VERIFIED_PHONE
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
