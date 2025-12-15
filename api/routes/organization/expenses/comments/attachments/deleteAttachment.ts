import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../../utils/response';
import { db, expenses, comments, attachments } from '../../../../../db';
import { isValidUUID } from '../../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const attachmentId = req.params.attachment_id
        const commentId = req.params.comment_id
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!attachmentId || !isValidUUID(attachmentId)) return res.status(400).json(createErrorResponse('Invalid attachment id.'))
        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse('Invalid comment id.'))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse('Invalid expense id.'))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid org id.'))

        await db.transaction(async (tx) => {
            // make sure the expense belongs to the org
            const expense = await tx.query.expenses.findFirst({
                where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId))
            })
            if (!expense) {
                return res.status(400).json(createErrorResponse('Expense not found.'))
            }

            // Remove the attachment
            const deleted = await tx.delete(attachments)
                .where(and(
                    eq(attachments.id, attachmentId),
                    eq(attachments.commentId, commentId)
                ))
                .returning();

            if (deleted.length > 0) {
                const comment = await tx.query.comments.findFirst({
                    where: eq(comments.id, commentId),
                    with: {
                        attachments: true
                    }
                });

                if (comment) {
                    if ((!comment.content || comment.content.trim() === '') && comment.attachments.length === 0) {
                        await tx.delete(comments).where(eq(comments.id, commentId));
                    }
                }
            }

            return res.json(createSuccessResponse(deleted.length))
        })

    } catch (error) {
        return res.status(400).json(createErrorResponse('An error occurred.', error))
    }
}
