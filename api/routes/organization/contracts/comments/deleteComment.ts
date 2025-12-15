import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, contracts, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes a comment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse('Invalid contract id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))

        const contract = await db.query.contracts.findFirst({
            where: and(eq(contracts.id, contractId), eq(contracts.organizationId, orgId))
        });
        if (!contract) return res.status(400).json(createErrorResponse('Contract not found.'))

        // Delete matches legacy conditions
        const deleted = await db.delete(comments)
            .where(and(
                eq(comments.id, commentId),
                eq(comments.contractId, contractId),
                eq(comments.organizationId, orgId)
            ))
            .returning();

        return res.status(200).json(createSuccessResponse(deleted.length)) // Legacy returned count/result
    } catch (err) {
        return res
            .status(400)
            .json(createErrorResponse('Failed to delete comment.'))
    }
}
