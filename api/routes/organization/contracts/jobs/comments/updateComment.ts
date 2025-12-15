import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import UUID from 'uuid';
import { pick } from '../../../../../utils';
import { db, jobs, comments, contracts, attachments } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import s3 from '../../../../../utils/s3';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments/{comment_id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Comment updated
 */
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const commentId = req.params.comment_id
        const contractId = req.params.contract_id

        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const body = { ...pick(req.body, ['content']) }

        await db.transaction(async (tx) => {
            const contract = await tx.query.contracts.findFirst({
                where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
            });
            if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            const job = await tx.query.jobs.findFirst({
                where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId))
            });
            if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            const commentAttachments = await tx.query.attachments.findMany({
                where: eq(attachments.commentId, commentId)
            });
            const currentAttachmentsCount = commentAttachments.length;

            const files = (req as any).files;
            if ((!files || files.length <= 0) && (!body.content || body.content.length === 0)) {
                if (currentAttachmentsCount === 0) {
                    return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
                }
            }

            const [comment] = await tx.update(comments)
                .set(body)
                .where(and(eq(comments.id, commentId), eq(comments.organizationId, orgId), eq(comments.jobId, jobId)))
                .returning();

            if (!comment) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            let createdAttachments = null
            if (files && files.length > 0) {
                const attachmentsData = files.map((file: any) => {
                    file.key = UUID.v4();
                    const accessUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${file.key}`
                    return {
                        id: file.key,
                        name: file.originalname,
                        type: file.mimetype,
                        size: file.size,
                        accessUrl,
                        commentId: commentId,
                    }
                })

                createdAttachments = await tx.insert(attachments).values(attachmentsData).returning();
                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

