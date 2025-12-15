import { db, clients, comments } from '../../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { eq, and, count, desc } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/clients/{client_id}/comments:
 *   get:
 *     summary: Get comments for a client
 *     tags: [ClientComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const clientId = req.params.client_id
        const { page = 1, limit = 10 } = req.query
        const pageNum = parseInt(page as string); const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        const client = await db.query.clients.findFirst({ where: and(eq(clients.id, clientId), eq(clients.organizationId, orgId)) })
        if (!client) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        const commentsList = await db.query.comments.findMany({ where: eq(comments.clientId, clientId), with: { attachments: true }, limit: limitNum, offset: offset, orderBy: desc(comments.createdAt) })
        const totalCountResult = await db.select({ count: count() }).from(comments).where(eq(comments.clientId, clientId));
        const totalCount = totalCountResult[0].count; const totalPages = Math.ceil(totalCount / limitNum)
        return res.status(200).json(createSuccessResponse({ comments: commentsList, currentPage: pageNum, totalPages }))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
