import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, expenses, comments } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete an expense comment
 *     tags: [ExpenseComments]
 *     responses:
 *       200:
 *         description: Comment deleted
 */
export default async (req, res) => {
    try {
        const commentId = req.params.comment_id
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!commentId || !isValidUUID(commentId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))

        await db.transaction(async (tx) => {
            const expense = await tx.query.expenses.findFirst({ where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId)) })
            if (!expense) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

            await tx.delete(comments).where(and(eq(comments.id, commentId), eq(comments.expenseId, expenseId), eq(comments.organizationId, orgId))).returning();
            return res.status(200).json(createSuccessResponse(null))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
