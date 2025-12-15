import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, expenses, expenseEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// get expense entries
export default async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse('Expense ID is required'))

        // make sure the expense belongs to the org
        const expense = await db.query.expenses.findFirst({
            where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId))
        })
        if (!expense) {
            return res.status(400).json(createErrorResponse('Expense not found'))
        }

        const entries = await db.query.expenseEntries.findMany({
            where: eq(expenseEntries.expenseId, expenseId)
        })

        res.status(200).json(createSuccessResponse(entries))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
