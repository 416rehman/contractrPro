import { db, expenses, expenseEntries } from '../../../db';
import { createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { ErrorCode } from '../../../utils/errorCodes';
import { isValidUUID } from '../../../utils/isValidUUID';
import { pick } from '../../../utils/index';
import { eq, and } from 'drizzle-orm';

/**
 * @openapi
 * /organizations/{org_id}/expenses/{expense_id}:
 *   patch:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: Expense updated
 */
export default async (req, res) => {
    try {
        const { org_id, expense_id } = req.params
        if (!org_id || !isValidUUID(org_id)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_ORG_ID_REQUIRED))
        if (!expense_id || !isValidUUID(expense_id)) return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_INVALID_UUID))

        const entriesData = req.body?.ExpenseEntries?.map((entry: any) =>
            pick(entry, ['description', 'quantity', 'unitCost', 'name'])
        ) || []

        if (entriesData.length === 0) {
            return res.status(400).json(createErrorResponse(ErrorCode.VALIDATION_FIELD_REQUIRED))
        }

        const body = {
            ...pick(req.body, ['description', 'date', 'taxRate', 'VendorId', 'ContractId', 'JobId']),
            vendorId: req.body.VendorId,
            contractId: req.body.ContractId,
            jobId: req.body.JobId,
            organizationId: org_id,
            updatedByUserId: req.auth.id,
            amount: '0'
        }

        Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

        const totalAmount = entriesData.reduce((sum: number, entry: any) => {
            return sum + (Number(entry.quantity || 0) * Number(entry.unitCost || 0));
        }, 0);
        body.amount = String(totalAmount);

        await db.transaction(async (tx) => {
            const expense = await tx.query.expenses.findFirst({
                where: and(eq(expenses.id, expense_id), eq(expenses.organizationId, org_id))
            });

            if (!expense) return res.status(400).json(createErrorResponse(ErrorCode.RESOURCE_NOT_FOUND));

            await tx.update(expenses).set(body).where(eq(expenses.id, expense.id));

            if (entriesData.length > 0) {
                await tx.delete(expenseEntries).where(eq(expenseEntries.expenseId, expense.id));

                const entriesWithId = entriesData.map((entry: any) => ({
                    ...entry,
                    expenseId: expense.id,
                    amount: String(Number(entry.quantity || 0) * Number(entry.unitCost || 0)),
                    description: entry.description || entry.name,
                    updatedByUserId: req.auth.id
                }));
                await tx.insert(expenseEntries).values(entriesWithId);
            }

            const updated = await tx.query.expenses.findFirst({
                where: eq(expenses.id, expense.id),
                with: { expenseEntries: true }
            });

            return res.status(200).json(createSuccessResponse(updated))
        });
    } catch (e: any) {
        return res.status(400).json(createErrorResponse(ErrorCode.INTERNAL_ERROR, e))
    }
}

