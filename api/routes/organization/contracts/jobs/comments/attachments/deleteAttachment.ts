import { createSuccessResponse, createErrorResponse } from '../../../../../../utils/response';
import { ErrorCode } from '../../../../../../utils/errorCodes';
import { db, jobs, comments, attachments } from '../../../../../../db';
import { isValidUUID } from '../../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments/{comment_id}/attachments/{attachment_id}:
 *   delete:
 *     summary: Delete an attachment from a job comment
 *     tags: [JobComments]
 *     responses:
 *       200:
 *         description: Attachment deleted
 */
export default async (req, res) => {
    try {
        const attachmentId = req.params.attachment_id
        const commentId = req.params.comment_id
        const jobId = req.params.job_id
        const orgId = req.params.org_id

        if (!attachmentId || !isValidUUID(attachmentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        await db.transaction(async (tx) => {
            const job = await tx.query.jobs.findFirst({ where: and(eq(jobs.id, jobId), eq(jobs.organizationId, orgId)) })
            if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            const deleted = await tx.delete(attachments).where(and(eq(attachments.id, attachmentId), eq(attachments.commentId, commentId))).returning();

            if (deleted.length > 0) {
                const comment = await tx.query.comments.findFirst({ where: eq(comments.id, commentId), with: { attachments: true } });
                if (comment && (!comment.content || comment.content.trim() === '') && comment.attachments.length === 0) {
                    await tx.delete(comments).where(eq(comments.id, commentId));
                }
            }
            return res.json(createSuccessResponse(null))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}
