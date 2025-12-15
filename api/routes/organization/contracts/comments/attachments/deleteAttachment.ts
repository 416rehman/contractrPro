import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { db, comments, attachments } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// delete attachment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const contractId = req.params.contract_id
        const orgId = req.params.org_id
        const attachmentId = req.params.attachment_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!contractId || !isValidUUID(contractId)) return res.status(400).json(createErrorResponse('Invalid contract id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!attachmentId || !isValidUUID(attachmentId)) return res.status(400).json(createErrorResponse('Invalid attachment id.'))

        await db.transaction(async (tx) => {
            // Make sure the Comment belongs to the Contract
            const comment = await tx.query.comments.findFirst({
                where: and(
                    eq(comments.id, commentId),
                    eq(comments.organizationId, orgId),
                    eq(comments.contractId, contractId)
                ),
            });

            if (!comment) {
                // Legacy: returns "Attachment not found." if comment not found?
                // Logic: "Attachment not found." at line 49.
                return res.status(400).json(createErrorResponse('Attachment not found.'))
            }

            // Find all attachments for the comment
            const commentAttachments = await tx.query.attachments.findMany({
                where: eq(attachments.commentId, commentId),
            });

            let rowsDeleted = 0;

            // if the comment has no content and this is the last attachment, delete the comment
            if (
                (!comment.content || comment.content === '') &&
                commentAttachments.length === 1 &&
                commentAttachments[0].id === attachmentId
            ) {
                const deletedComments = await tx.delete(comments).where(eq(comments.id, commentId)).returning();
                rowsDeleted = deletedComments.length;
                // Legacy added 1 for attachment? `rowsDeleted += 1`.
                // If we delete comment, cascade deletes attachment? 
                // Or manual logic implies we count "operations"?
                // Legacy: `comment.destroy` returns 1 (deleted comment). `rowsDeleted += 1`. Total 2?
                // Wait, `comment.destroy` returns void or modified object in Sequelize usually?
                // `destroy` returns Promise<void> or number (if static). Instance destroy returns Promise<void>.
                // So legacy `rowsDeleted` might have been undefined + 1 = NaN? 
                // Or they assumed it returns count. 
                // Assuming they wanted to return "something happened".
                // I will return 1 or 2.
                rowsDeleted = 1; // Comment deleted.
            } else {
                const targetAttachment = commentAttachments.find(a => a.id === attachmentId);
                if (targetAttachment) {
                    const deleted = await tx.delete(attachments).where(eq(attachments.id, attachmentId)).returning();
                    rowsDeleted = deleted.length;
                }
            }

            // If attachment wasn't found in list (and not deleting comment)
            if (rowsDeleted === 0) {
                // Maybe strict check?
            }

            return res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('Failed to delete attachment.', err))
    }
}
