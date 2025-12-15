import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import UUID from 'uuid';
import { pick } from '../../../../../utils';
import { db, comments, attachments, jobs, contracts } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import s3 from '../../../../../utils/s3';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse('Invalid job id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse('Invalid contract id.'))

        const body = {
            ...pick(req.body, ['content']),
            jobId: jobId,
            authorId: req.auth.id,
            // UpdatedByUserId: req.auth.id, // Not in Drizzle schema for comments yet? Check comment schema later. 
            // Comment schema logic: authorId mostly. 
            organizationId: orgId,
        }

        await db.transaction(async (tx) => {
            // make sure the contract belongs to the organization
            const contract = await tx.query.contracts.findFirst({
                where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
            });
            if (!contract) {
                return res.status(400).json(createErrorResponse('Contract not found.'))
            }

            const job = await tx.query.jobs.findFirst({
                where: and(eq(jobs.id, jobId), eq(jobs.contractId, contractId))
            });

            if (!job) {
                return res.status(400).json(createErrorResponse('Job not found.'))
            }

            const files = (req as any).files;
            if (
                (!files || files.length <= 0) &&
                (!body.content || body.content.length === 0)
            ) {
                return res.status(400).json(createErrorResponse('Content cannot be empty if there are no attachments.'))
            }

            // Create the comment
            const [comment] = await tx.insert(comments).values(body).returning();
            if (!comment) {
                return res.status(400).json(createErrorResponse('Failed to create comment.'))
            }

            let createdAttachments = null
            // Check if there are any attachments
            if (files && files.length > 0) {
                // Process attachments
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
                if (!createdAttachments) {
                    return res.status(400).json(createErrorResponse('Failed to create attachments.'))
                }

                // upload the attachments to s3Client
                for (const file of files) {
                    await s3.upload(file, file.key)
                }
            }

            (comment as any).Attachments = createdAttachments

            return res.json(createSuccessResponse(comment))
        })
    } catch (error) {
        return res.status(400).json(createErrorResponse('An error occurred.', error))
    }
}
