import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, clients, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a client comment
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const clientId = req.params.client_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!clientId || !isValidUUID(clientId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        await db.transaction(async (tx) => {
            const client = await tx.query.clients.findFirst({ where: and(eq(clients.id, clientId), eq(clients.organizationId, orgId)) })
            if (!client) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            await tx.delete(comments).where(and(eq(comments.id, commentId), eq(comments.clientId, clientId), eq(comments.organizationId, orgId))).returning();
            return res.status(200).json(createSuccessResponse(null))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
