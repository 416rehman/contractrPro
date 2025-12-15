import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../../utils/response';
import { db, comments, attachments } from '../../../../../../db';
import { isValidUUID } from '../../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// delete attachment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const jobId = req.params.job_id
        const orgId = req.params.org_id
        const attachmentId = req.params.attachment_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!jobId || !isValidUUID(jobId)) return res.status(400).json(createErrorResponse('Invalid job id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))
        if (!attachmentId || !isValidUUID(attachmentId)) return res.status(400).json(createErrorResponse('Invalid attachment id.'))

        await db.transaction(async (tx) => {
            // Make sure the Comment belongs to the Job
            const comment = await tx.query.comments.findFirst({
                where: and(
                    eq(comments.id, commentId),
                    eq(comments.organizationId, orgId),
                    eq(comments.jobId, jobId)
                )
            });

            if (!comment) {
                return res.status(400).json(createErrorResponse('Comment/Attachment not found (comment).'))
            }

            // Find all attachments for the comment
            const allAttachments = await tx.query.attachments.findMany({
                where: eq(attachments.commentId, commentId)
            });

            // Ensure the attachment exists in the list
            const attachmentToDelete = allAttachments.find(a => a.id === attachmentId);
            if (!attachmentToDelete) {
                return res.status(400).json(createErrorResponse('Attachment not found.'))
            }

            let rowsDeleted = 0

            // if the comment has no content and this is the last attachment, delete the comment
            if (
                (!comment.content || comment.content === '') &&
                allAttachments.length === 1
            ) {
                const deletedComments = await tx.delete(comments)
                    .where(eq(comments.id, commentId))
                    .returning();
                rowsDeleted = deletedComments.length > 0 ? 1 : 0;
                rowsDeleted += 1 // add 1 for the attachment implicitly
            } else {
                const deletedAttachments = await tx.delete(attachments)
                    .where(eq(attachments.id, attachmentId))
                    .returning();
                rowsDeleted = deletedAttachments.length;
            }

            return res.status(200).json(createSuccessResponse(rowsDeleted))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('Failed to delete attachment.', err))
    }
}
