import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import { db, jobs, comments, contracts } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        await db.transaction(async (tx) => {
            const contract = await tx.query.contracts.findFirst({
                where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
            });
            if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            const job = await tx.query.jobs.findFirst({
                where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId))
            });
            if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            await tx.delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.jobId, jobId),
                    eq(comments.organizationId, orgId)
                ))
                .returning();

            return res.status(200).json(createSuccessResponse(null))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

