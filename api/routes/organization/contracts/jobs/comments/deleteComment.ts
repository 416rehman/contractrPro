import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { db, jobs, comments, contracts } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes a comment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const contractId = req.params.contract_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse('Invalid job id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse('Invalid contract id.'))

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

            // Delete the comment
            const deleted = await tx.delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.jobId, jobId),
                    eq(comments.organizationId, orgId)
                ))
                .returning();

            if (!deleted.length) {
                // If standard delete, returning empty if not found. Legacy checked count.
            }

            return res.status(200).json(createSuccessResponse(deleted.length))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('Failed to delete comment.'))
    }
}
