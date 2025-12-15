import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, tokens, users } from '../../db';
import { tokenFlags, UserFlags } from '../../db/flags';
import { isFlagSet } from '../../utils/flags';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /auth/verify-phone:
 *   post:
 *     summary: Verify phone number using a token
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phone verified
 *       400:
 *         description: Invalid or expired token
 */
export default async (req, res) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== 'string' || token.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_MISSING_TOKEN));
        }

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
        });

        return res.json(createSuccessResponse(null));

    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
    }
}
