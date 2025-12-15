import { db, contracts, comments } from '../../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { eq, and, count, desc } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/comments:
 *   get:
 *     summary: Get comments for a contract
 *     tags: [ContractComments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const contractId = req.params.contract_id
        const { page = 1, limit = 10 } = req.query
        const pageNum = parseInt(page as string); const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        const contract = await db.query.contracts.findFirst({ where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId)) })
        if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        const commentsList = await db.query.comments.findMany({ where: eq(comments.contractId, contractId), with: { attachments: true }, limit: limitNum, offset: offset, orderBy: desc(comments.createdAt) })
        const totalCountResult = await db.select({ count: count() }).from(comments).where(eq(comments.contractId, contractId));
        const totalCount = totalCountResult[0].count; const totalPages = Math.ceil(totalCount / limitNum)
        return res.status(200).json(createSuccessResponse({ comments: commentsList, currentPage: pageNum, totalPages }))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
