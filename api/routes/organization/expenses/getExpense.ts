import { db, expenses } from '../../../db';
import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../utils/response';
import { isValidUUID } from '../../../utils/isValidUUID';
import { eq, and } from 'drizzle-orm';

// get org expense
export default async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse('Invalid expense_id'))

        const result = await db.query.expenses.findFirst({
            where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId)),
            with: {
                expenseEntries: true
            }
        });

        if (!result) {
            return res.status(400).json(createErrorResponse('Expense not found'))
        }

        return res.status(200).json(createSuccessResponse(result))
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
