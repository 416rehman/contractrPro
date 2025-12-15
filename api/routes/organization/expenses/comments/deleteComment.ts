import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, expenses, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// Deletes a comment
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

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

            // Delete the comment
            const deleted = await tx.delete(comments)
                .where(and(
                    eq(comments.id, commentId),
                    eq(comments.expenseId, expenseId),
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
