// DELETE /organizations/:org_id/contracts/:contract_id/expenses/:expense_id
import { db, expenses } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

export default async (req, res) => {
    try {
        const orgId = req.params.org_id
        const expenseId = req.params.expense_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Organization ID is required'))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse('Expense ID is required'))

        const deleted = await db.delete(expenses)
            .where(and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId)))
            .returning();

        if (!deleted.length) {
            return res.status(400).json(createErrorResponse('Expense not found'))
        }

        res.status(200).json(createSuccessResponse(deleted.length))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
