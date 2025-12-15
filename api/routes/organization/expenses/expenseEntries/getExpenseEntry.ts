import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, expenses, expenseEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// get expense entry
export default async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const expenseEntryId = req.params.entry_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse('Expense ID is required'))
        if (!expenseEntryId || !isValidUUID(expenseEntryId)) return res.status(400).json(createErrorResponse('ExpenseEntry ID is required'))

        // make sure the expense belongs to the org
        const expense = await db.query.expenses.findFirst({
            where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId))
        })
        if (!expense) {
            return res.status(400).json(createErrorResponse('Expense not found'))
        }

        const expenseEntry = await db.query.expenseEntries.findFirst({
            where: and(
                eq(expenseEntries.expenseId, expenseId),
                eq(expenseEntries.id, expenseEntryId)
            )
        })

        if (!expenseEntry) {
            return res.status(400).json(createErrorResponse('ExpenseEntry not found'))
        }

        res.status(200).json(createSuccessResponse(expenseEntry))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
