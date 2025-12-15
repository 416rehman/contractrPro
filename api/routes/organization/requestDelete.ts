import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { db, tokens, organizations } from '../../db';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';
import { isValidUUID } from '../../utils/isValidUUID';

/**
 * @openapi
 * /organizations/{org_id}/request-delete:
 *   post:
 *     summary: Request a token to delete an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Confirmation code sent (mocked)
 *       400:
 *         description: Invalid organization or not owner
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id;
        const userId = req.auth.id;

        if (!orgId || !isValidUUID(orgId)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED));
        }

        const org = await db.query.organizations.findFirst({
            where: eq(organizations.id, orgId)
        });

        if (!org) {
            return res.status(400).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND));
        }

        if (org.ownerId !== userId) {
            // Only owner can delete organization
            return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED));
        }

        await db.transaction(async (tx) => {
            // Invalidate any existing delete tokens for this organization
            // Since tokens table links to USER, we find tokens for this user with the specific flag AND meta.orgId matching
            // However, finding by meta in JSONB can be tricky depending on driver support. 
            // Simplified approach: Invalidate ALL ORG_DELETE_TOKENs for this user. 
            // Or better: Invalidate ORG_DELETE_TOKENs for this user that map to this orgId.
            // Using a raw query or fetching and filtering might be needed if JSONB query isn't directly supported by simple helpers.
            // For now, let's invalidate all ORG_DELETE_TOKENs for this user to be safe and simple 
            // (user unlikely to be deleting multiple orgs simultaneously).

            await tx.delete(tokens).where(and(
                eq(tokens.userId, userId),
                eq(tokens.flags, tokenFlags.ORG_DELETE_TOKEN)
            ));

            const tokenValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
            const tokenBody = {
                type: 'org_delete',
                value: tokenValue,
                userId: userId,
                flags: tokenFlags.ORG_DELETE_TOKEN,
                meta: { orgId }
            };

            await tx.insert(tokens).values(tokenBody);

            // TODO: Send email
            console.log(`[Mock Email] Delete Organization Code for ${org.name}: ${tokenValue}`);
        });

        return res.json(createSuccessResponse(null));

    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error));
    }
}
