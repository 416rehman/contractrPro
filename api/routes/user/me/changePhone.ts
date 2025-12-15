import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, users, tokens } from '../../../db';
import { tokenFlags } from '../../../db/flags';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /users/me/phone:
 *   patch:
 *     summary: Request phone change
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Verification SMS sent
 */
export default async (req, res) => {
    try {
        const phoneCountry = req.body?.phoneCountry?.trim()
        const phoneNumber = req.body?.phoneNumber?.trim()
        const UserId = req.auth.id

        if (!phoneCountry || phoneCountry.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        if (!phoneNumber || phoneNumber.length < 1) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        if (!/^\d+$/.test(phoneCountry) || phoneCountry.length > 5) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        if (!/^\d+$/.test(phoneNumber) || phoneNumber.length > 20) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const user = await db.query.users.findFirst({ where: eq(users.id, UserId) });
        if (!user) {
            return res.status(400).json(createErrorResponse(ErrorCode.AUTH_USER_NOT_FOUND))
        }

        if (user.phoneCountry === phoneCountry && user.phoneNumber === phoneNumber) {
            return res.status(200).json(createSuccessResponse(null))
        }

        await db.transaction(async (tx) => {
            const tokenValue = Math.floor(100000 + Math.random() * 900000).toString();
            const tokenBody = {
                type: 'phone_verify',
                value: tokenValue,
                userId: UserId,
                flags: tokenFlags.USER_PHONE_VERIFY_TOKEN,
                meta: { phoneCountry, phoneNumber }
            };

            const preExistingToken = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.userId, user.id),
                    eq(tokens.flags, tokenFlags.USER_PHONE_VERIFY_TOKEN),
                )
            })

            if (preExistingToken) {
                await tx.update(tokens).set(tokenBody).where(eq(tokens.id, preExistingToken.id));
            } else {
                await tx.insert(tokens).values(tokenBody);
            }

            return res.json(createSuccessResponse(null))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

