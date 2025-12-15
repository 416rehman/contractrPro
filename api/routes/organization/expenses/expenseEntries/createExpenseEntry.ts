import {
    createSuccessResponse,
    createErrorResponse,
} from '../../../../utils/response';
import { db, expenses, expenseEntries } from '../../../../db';
import { isValidUUID } from '../../../../utils/isValidUUID';
import { pick } from '../../../../utils';
import { eq, and } from 'drizzle-orm';

// create expense entry
export default async (req, res) => {
    try {
        const expenseId = req.params.expense_id
        const orgId = req.params.org_id

        if (!orgId || !isValidUUID(orgId)) return res.status(400).json(createErrorResponse('Invalid organization_id'))
        if (!expenseId || !isValidUUID(expenseId)) return res.status(400).json(createErrorResponse('Expense ID is required'))

        await db.transaction(async (tx) => {
            // make sure the expense belongs to the org
            const expense = await tx.query.expenses.findFirst({
                where: and(eq(expenses.id, expenseId), eq(expenses.organizationId, orgId))
            })
            if (!expense) {
                return res.status(400).json(createErrorResponse('Expense not found'));
            }

            const [expenseEntry] = await tx.insert(expenseEntries)
                .values({
                    ...pick(req.body, [
                        'name',
                        'description',
                        'unitCost',
                        'quantity',
                    ]),
                    expenseId: expenseId,
                })
                .returning();

            res.status(200).json(createSuccessResponse(expenseEntry))
        })
    } catch (err) {
        return res.status(400).json(createErrorResponse('', err))
    }
}
