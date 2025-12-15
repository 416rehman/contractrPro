import { db, jobs, comments, contracts } from '../../../../../db';
import { createErrorResponse, createSuccessResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and, count, desc } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments:
 *   get:
 *     summary: Get comments for a job
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const jobId = req.params.job_id
        const contractId = req.params.contract_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const { page = 1, limit = 10 } = req.query
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const job = await db.query.jobs.findFirst({
            where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId))
        });
        if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

        const commentsList = await db.query.comments.findMany({
            where: eq(comments.jobId, jobId),
            with: { attachments: true },
            limit: limitNum,
            offset: offset,
            orderBy: desc(comments.createdAt)
        })

        const totalCountResult = await db.select({ count: count() })
            .from(comments)
            .where(eq(comments.jobId, jobId));

        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / limitNum)
        const response = { comments: commentsList, currentPage: pageNum, totalPages }

        return res.status(200).json(createSuccessResponse(response))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

