import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, clients, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes a comment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const clientId = req.params.client_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!clientId || !isValidUUID(clientId)) return res.status(400).json(createErrorResponse('Invalid client id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))

        await db.transaction(async (tx) => {
            // make sure the client belongs to the org
            const client = await tx.query.clients.findFirst({
                where: and(eq(clients.id, clientId), eq(clients.organizationId, orgId))
            })
            if (!client) {
                return res.status(400).json(createErrorResponse('Client not found.'))
            }

            // Delete the comment
            const deleted = await tx.delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.clientId, clientId),
                    eq(comments.organizationId, orgId)
                ))
                .returning();

            if (!deleted.length) {
                // If standard delete, returning empty if not found. Legacy checked count.
            }

            return res.status(200).json(createSuccessResponse(deleted.length)) // Sending count
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('Failed to delete comment.', err))
    }
}
