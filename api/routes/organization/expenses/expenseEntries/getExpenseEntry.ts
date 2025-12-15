import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { ErrorCode } from '../../../../utils/errorCodes';
import { db, expenses, expenseEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}/entries/{entry_id}:
 *   get:
 *     summary: Get a single expense entry
 *     tags: [ExpenseEntries]
 *     responses:
 *       200:
 *         description: Expense entry details
 */
export default async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const expenseEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))
        if (!expenseEntryId || !isValidUUID(expenseEntryId)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const expense = await db.query.expenses.findFirst({
            where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId))
        })
        if (!expense) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        const expenseEntry = await db.query.expenseEntries.findFirst({
            where: and(eq(expenseEntries.expenseId, expenseId), eq(expenseEntries.id, expenseEntryId))
        })

        if (!expenseEntry) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND))

        res.status(200).json(createSuccessResponse(expenseEntry))
    } catch (err) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, err))
    }
}
