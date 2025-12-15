import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { db, tokens } from '../../../db';
import { tokenFlags } from '../../../db/flags';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const schema = z.object({
    // No body required
});

/**
 * @openapi
 * /auth/account/token:
 *   post:
 *     summary: Request account deletion token
 *     description: |
 *       Generates and emails a confirmation token required to permanently delete the account.
 *       
 *       **Rate Limit**: 5 requests per 15 minutes.
 *       
 *       **Security**:
 *       - Requires a valid Access Token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token sent to email
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many attempts
 */
const handler = async (req, res) => {
    try {
        await db.transaction(async (tx) => {
            // Invalidate existing tokens
            await tx.delete(tokens).where(and(
                eq(tokens.userId, req.auth.id),
                eq(tokens.flags, tokenFlags.USER_ACCOUNT_DELETE_TOKEN)
            ));

            const tokenBody = {
                userId: req.auth.id,
                type: 'account_deletion',
                value: randomUUID(),
                flags: tokenFlags.USER_ACCOUNT_DELETE_TOKEN
            }

            // Mock email sending
            console.log(`[Mock Email] Account deletion token for user ${req.auth.id}: ${tokenBody.value}`)

            await tx.insert(tokens).values(tokenBody);

            return res.json(createSuccessResponse(null))
        })
    } catch (error) {
        return res.status(500).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

export default { schema, handler };
