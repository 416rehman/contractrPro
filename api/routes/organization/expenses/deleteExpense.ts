import { db, expenses } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: Expense deleted
 */
export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const expenseId = req.params.expense_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const deleted = await db.delete(expenses)
            .where(and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId)))
            .returning();

        if (!deleted.length) {
            return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))
        }

        res.status(200).json(createSuccessResponse(null))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}

