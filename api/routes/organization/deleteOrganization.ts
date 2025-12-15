import { db, organizations, tokens } from '../../db';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';
import { ErrorCode } from '../../utils/errorCodes';
import { isValidUUID } from '../../utils/isValidUUID';
import { tokenFlags } from '../../db/flags';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}:
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The 6-digit confirmation code received via email
 *     responses:
 *       200:
 *         description: Organization deleted
 *       400:
 *         description: Invalid ID, token, or not found
 */
export default async (req, res) => {
    try {
        const org_id = req.params.org_id
        const user_id = req.auth.id
        const { token } = req.query

        if (!org_id || !isValidUUID(org_id)) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        }

        if (!token || typeof token !== 'string') {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_MISSING_TOKEN))
        }

        await db.transaction(async (tx) => {
            const org = await tx.query.organizations.findFirst({
                where: eq(organizations.id, org_id)
            })

            if (!org) {
                return res.status(400).json(createErrorResponse(ErrorCode.ORG_NOT_FOUND))
            }

            if (org.ownerId !== user_id) {
                return res.status(403).json(createErrorResponse(ErrorCode.AUTH_UNAUTHORIZED))
            }

            // Validate Token
            const tokenInstance = await tx.query.tokens.findFirst({
                where: and(
                    eq(tokens.value, token),
                    eq(tokens.userId, user_id),
                    eq(tokens.flags, tokenFlags.ORG_DELETE_TOKEN)
                )
            });

            if (!tokenInstance) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_TOKEN));
            }

            // Validate Token Meta to ensure it's for THIS organization
            const meta = tokenInstance.meta as any;
            if (!meta || meta.orgId !== org_id) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_TOKEN));
            }

            // Delete Organization
            await tx.delete(organizations).where(eq(organizations.id, org_id));

            // Consume Token
            await tx.delete(tokens).where(eq(tokens.id, tokenInstance.id));
        });

        res.status(200).json(createSuccessResponse(null))
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

