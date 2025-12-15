import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response';
import { ErrorCode } from '../../../../../utils/errorCodes';
import UUID from 'uuid';
import { pick } from '../../../../../utils';
import { db, comments, attachments, jobs, contracts } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import s3 from '../../../../../utils/s3';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/contracts/{contract_id}/jobs/{job_id}/comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Comment created
 */
export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const body = {
            ...pick(req.body, ['content']),
            jobId: jobId,
            authorId: req.auth.id,
            organizationId: orgId,
        }

        await db.transaction(async (tx) => {
            const contract = await tx.query.contracts.findFirst({
                where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
            });
            if (!contract) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            const job = await tx.query.jobs.findFirst({
                where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId))
            });
            if (!job) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            const files = (req as any).files;
            if ((!files || files.length <= 0) && (!body.content || body.content.length === 0)) {
                return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
            }

            const [comment] = await tx.insert(comments).values(body).returning();
            if (!comment) return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR))

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
                        commentId: comment.id,
                    }
                })

                createdAttachments = await tx.insert(attachments).values(attachmentsData).returning();
                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            (comment as any).Attachments = createdAttachments
            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, error))
    }
}

